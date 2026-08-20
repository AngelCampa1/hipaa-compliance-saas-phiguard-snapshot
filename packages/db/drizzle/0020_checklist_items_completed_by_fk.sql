-- Add FK from checklist_items.completed_by to users.id
-- ON DELETE SET NULL so deleting a user does not cascade-delete completed items
ALTER TABLE "checklist_items"
  ADD CONSTRAINT "checklist_items_completed_by_users_id_fk"
  FOREIGN KEY ("completed_by")
  REFERENCES "users"("id")
  ON DELETE SET NULL;
