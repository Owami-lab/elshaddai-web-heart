(async () => {
  const base = "http://localhost:8080";
  try {
    const loginRes = await fetch(base + "/api/users/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: "andi", password: "Andi@1986" }),
    });
    const token = await loginRes.text();
    const setCookie = loginRes.headers.get("set-cookie") || loginRes.headers.get("Set-Cookie");
    console.log("tokenLength:", token?.length || 0);
    if (!token) {
      console.error("No token received; aborting");
      process.exit(1);
    }
    const authHeader = {
      Authorization: "Bearer " + token,
      "content-type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Origin: "http://localhost:5173",
    };
    const cookieHeader = setCookie ? { Cookie: setCookie.split(";")[0] } : {};

    let sermonId = null;
    let deptId = null;

    try {
      const sres = await fetch(base + "/api/sermons", {
        method: "POST",
        headers: { ...authHeader, ...cookieHeader },
        body: JSON.stringify({
          title: "CI Test Sermon",
          preacher: "Andi",
          description: "Test created by CI",
          date: "2026-05-19",
          videoUrl: "",
        }),
      });
      const sjson = await sres.json().catch(() => null);
      console.log("sermon create status:", sres.status);
      console.log("sermon create body:", sjson);
      sermonId = sjson?.id || sjson?._id || null;
    } catch (e) {
      console.error("sermon create failed", e);
    }

    try {
      const dres = await fetch(base + "/api/departments", {
        method: "POST",
        headers: { ...authHeader, ...cookieHeader },
        body: JSON.stringify({ name: "CI Outreach", description: "Created by CI" }),
      });
      const djson = await dres.json().catch(() => null);
      console.log("dept create status:", dres.status);
      console.log("dept create body:", djson);
      deptId = djson?.id || djson?._id || null;
    } catch (e) {
      console.error("dept create failed", e);
    }

    try {
      const sl = await fetch(base + "/api/sermons", {
        headers: { ...authHeader, ...cookieHeader },
      });
      const sa = await sl.json().catch(() => null);
      console.log(
        "sermons list status:",
        sl.status,
        "count:",
        Array.isArray(sa) ? sa.length : "n/a",
      );
      const dl = await fetch(base + "/api/departments", {
        headers: { ...authHeader, ...cookieHeader },
      });
      const da = await dl.json().catch(() => null);
      console.log(
        "departments list status:",
        dl.status,
        "count:",
        Array.isArray(da) ? da.length : "n/a",
      );
    } catch (e) {
      console.error("listing failed", e);
    }

    try {
      if (sermonId) {
        const r = await fetch(base + "/api/sermons/" + sermonId, {
          method: "DELETE",
          headers: { ...authHeader, ...cookieHeader },
        });
        console.log("delete sermon status:", r.status);
      } else {
        console.log("no sermon id to delete");
      }
    } catch (e) {
      console.error("delete sermon failed", e);
    }

    try {
      if (deptId) {
        const r = await fetch(base + "/api/departments/" + deptId, {
          method: "DELETE",
          headers: { ...authHeader, ...cookieHeader },
        });
        console.log("delete dept status:", r.status);
      } else {
        console.log("no dept id to delete");
      }
    } catch (e) {
      console.error("delete dept failed", e);
    }
  } catch (err) {
    console.error("error", err);
    process.exit(1);
  }
})();
