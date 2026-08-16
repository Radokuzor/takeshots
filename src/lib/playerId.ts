export function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("takeshots_player_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("takeshots_player_id", id);
  }
  return id;
}
