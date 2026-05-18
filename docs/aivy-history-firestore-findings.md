# Aivy history Firestore findings

## Scope

- Feature: Aivy chat history retention.
- Firestore instance: `(default)`, `STANDARD`, `FIRESTORE_NATIVE`, `asia-southeast1`.
- Client paths added:
  - `users/{uid}/aivyHistory/current`

## Access pattern

- Read: logged-in user may read only `users/{uid}/aivyHistory/current` where `uid == request.auth.uid`.
- Write: logged-in user may create/update only the `current` history document under their own user path.
- Delete: logged-in user may clear their own Aivy history.
- Admins may read/delete for support and moderation.

## Data model

Document: `users/{uid}/aivyHistory/current`

- `user_id`: string, must equal `{uid}`.
- `messages`: list, maximum 10 entries. Each entry is written by the app as `{ id, role, content, timestamp }`.
- `updated_at`: timestamp.

## Client behavior

- Local storage remains the primary chat memory for the current browser and is scoped by Firebase UID.
- Firestore mirrors only the latest 10 non-empty user/assistant messages to limit early-stage server usage.
- Model calls also send only the latest 10 user/assistant messages.
- Streaming placeholders, errors, and the welcome message are not persisted.
