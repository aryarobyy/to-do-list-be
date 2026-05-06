import { admin, adminFirestore } from '../firebase/admin.sdk';
import { NOTES_COLLECTION, USER_COLLECTION } from '../core/constants';
import { v4 } from 'uuid';

export enum NoteStatus {
  ACTIVE = "ACTIVE",
  DEACTIVE = "DEACTIVE",
}

export class NoteService {
  static async postNote(payload: any) {
    const { creatorId, schedule = '', updatedBy, title, content = '', status, priority, tags = [], collaborators, deadline, reminder, image, link, subTasks = [] } = payload;

    if (!creatorId) {
      throw new Error('creatorId is required');
    }

    if (!title) {
      throw new Error('title is required');
    }

    const id = v4();

    const creatorSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    const validSubTasks = Array.isArray(subTasks)
      ? subTasks.map((t) => ({
          text: t.text || "",
          isDone: !!t.isDone,
          isBold: !!t.isBold
      }))
      : [];

    const isValidStatus = (status: any): status is NoteStatus =>
        Object.values(NoteStatus).includes(status);
    
    const finalStatus = isValidStatus(status) ? status : NoteStatus.ACTIVE;

    const formattedTags = Array.isArray(tags)
        ? tags.map((tag) => tag.toUpperCase())
        : [];

    const data = {
        id,
        creatorId,
        title,
        content,
        schedule,
        status : finalStatus,
        tags: formattedTags,
        subTasks: validSubTasks,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(NOTES_COLLECTION)
        .doc(id)
        .set(data);

    return data;
  }

  static async updateNote(payload: any) {
    const { noteId, title, content, creatorId, status, subTasks, createdAt, updatedBy, schedule } = payload;
    
    if (!creatorId) {
        throw new Error("creatorId is required");
    }

    if (!noteId) {
        throw new Error("noteId is required");
    }

    const creatorSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    const data: Record<string, any> = {};
    
    if (title != null) data.title = title;
    if (content != null) data.content = content;
    if (schedule != null) data.schedule = schedule;
    if (status != null) data.status = status;
    if (updatedBy != null) data.updatedBy = updatedBy;
    if (subTasks != null) data.subTasks = subTasks;
    if (createdAt != null) data.createdAt = createdAt;
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const noteRef = adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(NOTES_COLLECTION)
        .doc(noteId);

    await noteRef.update(data);
    return data;
  }

  static async getNoteById(creatorId: string, noteId: string) {
    if (!creatorId || !noteId) {
      throw new Error('creatorId and noteId are required');
    }

    const creatorSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .get();

    if (!creatorSnap.exists) {
      throw new Error(`Unknown creator: ${creatorId}`);
    }

    const noteSnap = await adminFirestore
      .collection(USER_COLLECTION)
      .doc(creatorId)
      .collection(NOTES_COLLECTION)
      .doc(noteId)
      .get()

    if (!noteSnap.exists) {
        throw new Error("Note not found");
    }

    return noteSnap.data();
  }

  static async getNotesByCreator(creatorId: string) {
    if (!creatorId) {
      throw new Error('creatorId is required');
    }

    const notesRef = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(NOTES_COLLECTION)
        .get();

    return notesRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
  }

  static async getNotesByTags(creatorId: string, tags: any[]) {
    if (!creatorId) {
      throw new Error('creatorId is required');
    }

    if (!Array.isArray(tags) || tags.length === 0) {
        throw new Error("Tags must be a non-empty array");
    }

    const creatorDoc = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .get();

    if (!creatorDoc.exists) {
        throw new Error("User not found");
    }

    const notesRef = adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(NOTES_COLLECTION);

    const snapshot = await notesRef
        .where('tags', 'array-contains-any', tags)
        .get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
  }

  static async deleteNote(creatorId: string, noteId: string) {
    if (!creatorId || !noteId) {
      throw new Error('creatorId and noteId are required');
    }

    const creatorSnap = await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .get();

    if (!creatorSnap.exists) {
        throw new Error(`Unknown creator: ${creatorId}`);
    }

    await adminFirestore
        .collection(USER_COLLECTION)
        .doc(creatorId)
        .collection(NOTES_COLLECTION)
        .doc(noteId)
        .delete();

    return true;
  }
}
