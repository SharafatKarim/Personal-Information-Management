import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PimCard, PimCardInput } from "@/lib/types";

const cardsCol = (userId: string) => collection(db, "pim", userId, "cards");
const cardDoc = (userId: string, cardId: string) => doc(db, "pim", userId, "cards", cardId);

function mapCard(id: string, data: any): PimCard {
  return {
    id,
    title: data.title ?? "",
    category: data.category ?? "Other",
    fields: Array.isArray(data.fields) ? data.fields : [],
    isPinned: !!data.isPinned,
    icon: data.icon ?? undefined,
    order: typeof data.order === "number" ? data.order : undefined,
    attachmentUrl: data.attachmentUrl ?? undefined,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export async function listCards(userId: string): Promise<PimCard[]> {
  const snap = await getDocs(query(cardsCol(userId), orderBy("updatedAt", "desc")));
  return snap.docs.map((d) => mapCard(d.id, d.data()));
}

export async function getCard(userId: string, cardId: string): Promise<PimCard | null> {
  const snap = await getDoc(cardDoc(userId, cardId));
  if (!snap.exists()) return null;
  return mapCard(snap.id, snap.data());
}

async function nextOrder(userId: string): Promise<number> {
  const snap = await getDocs(cardsCol(userId));
  let max = -1;
  snap.forEach((d) => {
    const o = d.data().order;
    if (typeof o === "number" && o > max) max = o;
  });
  return max + 1;
}

export async function createCard(userId: string, input: PimCardInput): Promise<string> {
  const order = await nextOrder(userId);
  const payload: Record<string, unknown> = {
    title: input.title,
    category: input.category,
    fields: input.fields,
    isPinned: input.isPinned,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (input.icon) payload.icon = input.icon;
  if (input.attachmentUrl) payload.attachmentUrl = input.attachmentUrl;
  const ref = await addDoc(cardsCol(userId), payload);
  return ref.id;
}

// Optional fields that should be removed from the document when the user
// clears them. Every other `undefined` we silently drop so Firestore doesn't
// reject the write.
const CLEARABLE_FIELDS = new Set(["attachmentUrl", "icon"]);

export async function updateCard(
  userId: string,
  cardId: string,
  input: Partial<PimCardInput>,
): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) {
      if (CLEARABLE_FIELDS.has(key)) payload[key] = deleteField();
      continue;
    }
    payload[key] = value;
  }
  await updateDoc(cardDoc(userId, cardId), payload);
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  await deleteDoc(cardDoc(userId, cardId));
}

export async function togglePin(userId: string, cardId: string, isPinned: boolean): Promise<void> {
  await updateDoc(cardDoc(userId, cardId), { isPinned, updatedAt: serverTimestamp() });
}

/**
 * Persist drag-and-drop order. Writes `order = 0, 1, 2, ...` to each card
 * in the given list via a single batched write. Does not touch updatedAt.
 */
export async function reorderCards(userId: string, orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(cardDoc(userId, id), { order: index });
  });
  await batch.commit();
}
