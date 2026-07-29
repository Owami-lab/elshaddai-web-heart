(async () => {
  const base = "http://localhost:8080";
  const loginRes = await fetch(base + "/api/users/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ usernameOrEmail: "andi", password: "Andi@1986" }),
  });
  const token = await loginRes.text();
  console.log("tokenLength:", token?.length || 0);
  const res = await fetch(base + "/api/users", { headers: { Authorization: "Bearer " + token } });
  const arr = await res.json().catch(() => null);
  if (!arr) {
    console.log("Could not list users, status", res.status);
    return;
  }
  const me = arr.find((u) => u.username === "andi" || u.email === "andi");
  console.log("me:", me);
  if (me) console.log("role:", me.role);
})();
