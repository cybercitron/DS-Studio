// Plugin Figma « DS-Studio — variables » (décision du 29/10).
// Lit un fichier exporté par DS-Studio, montre ce qu'il va créer, puis n'écrit
// qu'après la validation de l'étudiante, liée à ce diff précis et à usage
// unique. Il relit ensuite chaque variable. Il ne remplace ni ne supprime
// jamais une variable existante, et n'utilise pas le réseau.

const FORMAT = 'ds-studio.figma-variables';
const VERSION = 1;
const MAX_VARIABLES = 500;
const NAME = /^[A-Za-z0-9]+(\/[A-Za-z0-9]+)*$/;
const HEX = /^#[0-9A-F]{6}$/;

// Vérifie le fichier avant toute lecture du document Figma.
function validateFile(file) {
  if (!file || typeof file !== 'object') return 'Fichier illisible.';
  if (file.format !== FORMAT)
    return 'Ce fichier ne vient pas de DS-Studio (format inconnu).';
  if (file.version !== VERSION)
    return `Version ${file.version} non prise en charge (attendue : ${VERSION}).`;
  if (
    typeof file.collection !== 'string' ||
    !file.collection.trim() ||
    file.collection.length > 40 ||
    file.collection.includes('/')
  )
    return 'Nom de collection invalide.';
  if (!Array.isArray(file.variables) || !file.variables.length)
    return 'Le fichier ne contient aucune variable.';
  if (file.variables.length > MAX_VARIABLES)
    return `${MAX_VARIABLES} variables au maximum par fichier.`;
  const seen = new Set();
  for (const v of file.variables) {
    if (!v || v.type !== 'COLOR')
      return 'Seules les couleurs sont prises en charge.';
    if (typeof v.name !== 'string' || !NAME.test(v.name))
      return `Nom de variable invalide : ${String(v && v.name)}`;
    if (typeof v.value !== 'string' || !HEX.test(v.value.toUpperCase()))
      return `Couleur invalide pour ${v.name} : attendue #RRGGBB.`;
    if (seen.has(v.name.toLowerCase())) return `Nom en double : ${v.name}`;
    seen.add(v.name.toLowerCase());
  }
  return '';
}

const channel = (n) =>
  Math.round(n * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
function toHex(value) {
  if (!value || typeof value !== 'object') return '?';
  if (value.type === 'VARIABLE_ALIAS') return 'alias';
  return `#${channel(value.r)}${channel(value.g)}${channel(value.b)}`;
}
function toRgb(hex) {
  const n = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
  return { r: n(1), g: n(3), b: n(5) };
}

// Le diff : à créer, déjà identique, ou différente (jamais modifiée).
async function makePlan(file) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collection =
    collections.find((c) => c.name === file.collection) || null;
  const existing = collection
    ? (await figma.variables.getLocalVariablesAsync()).filter(
        (v) => v.variableCollectionId === collection.id,
      )
    : [];
  const items = file.variables.map((v) => {
    const value = v.value.toUpperCase();
    const found = existing.find(
      (e) => e.name.toLowerCase() === v.name.toLowerCase(),
    );
    if (!found) return { name: v.name, value, status: 'create' };
    const current =
      found.resolvedType === 'COLOR'
        ? toHex(found.valuesByMode[collection.defaultModeId])
        : found.resolvedType.toLowerCase();
    return {
      name: v.name,
      value,
      status: found.name === v.name && current === value ? 'same' : 'conflict',
      current: found.name === v.name ? current : `${current} (${found.name})`,
    };
  });
  return {
    document: figma.root.name,
    collection: file.collection,
    collectionExists: !!collection,
    items,
  };
}
const signature = (plan) => JSON.stringify(plan);

let pending = null;

async function preview(file) {
  pending = null;
  const problem = validateFile(file);
  if (problem) return figma.ui.postMessage({ type: 'error', message: problem });
  const plan = await makePlan(file);
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  pending = { id, file, signature: signature(plan) };
  figma.ui.postMessage({ type: 'plan', id, plan });
}

async function apply(id) {
  // Une validation sert une seule fois, et seulement pour le diff affiché.
  const approved = pending;
  pending = null;
  if (!approved || approved.id !== id)
    return figma.ui.postMessage({
      type: 'refused',
      message: 'Aucune validation pour ce diff : rien n’a été écrit.',
    });
  const plan = await makePlan(approved.file);
  if (signature(plan) !== approved.signature)
    return figma.ui.postMessage({
      type: 'refused',
      message:
        'Le fichier Figma a changé depuis l’aperçu : rien n’a été écrit. Relancez l’aperçu.',
    });
  const toCreate = plan.items.filter((i) => i.status === 'create');
  if (!toCreate.length)
    return figma.ui.postMessage({
      type: 'refused',
      message: 'Rien à créer : rien n’a été écrit.',
    });

  let collection = (
    await figma.variables.getLocalVariableCollectionsAsync()
  ).find((c) => c.name === plan.collection);
  if (!collection)
    collection = figma.variables.createVariableCollection(plan.collection);
  const created = [];
  for (const item of toCreate) {
    const variable = figma.variables.createVariable(
      item.name,
      collection,
      'COLOR',
    );
    variable.setValueForMode(collection.defaultModeId, toRgb(item.value));
    created.push({ id: variable.id, name: item.name, value: item.value });
  }

  // Relecture : chaque variable est relue dans le document après l'écriture.
  const readback = [];
  for (const c of created) {
    const v = await figma.variables.getVariableByIdAsync(c.id);
    const read = v
      ? toHex(v.valuesByMode[collection.defaultModeId])
      : 'absente';
    readback.push({
      name: c.name,
      expected: c.value,
      read,
      ok: read === c.value,
    });
  }
  figma.ui.postMessage({
    type: 'done',
    document: figma.root.name,
    collection: plan.collection,
    readback,
    untouched: plan.items.filter((i) => i.status !== 'create').length,
  });
}

figma.showUI(__html__, { width: 480, height: 600, themeColors: true });
figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'preview') await preview(msg.file);
    else if (msg.type === 'apply') await apply(msg.id);
    else if (msg.type === 'cancel') {
      pending = null;
      figma.ui.postMessage({
        type: 'refused',
        message: 'Annulé : rien n’a été écrit.',
      });
    } else if (msg.type === 'close') figma.closePlugin();
  } catch (e) {
    pending = null;
    figma.ui.postMessage({
      type: 'error',
      message: `Erreur : ${e && e.message ? e.message : String(e)}. Relancez l’aperçu pour voir l’état réel du fichier.`,
    });
  }
};
