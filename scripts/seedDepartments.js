/**
 * Seed default departments into the database
 * Usage: node scripts/seedDepartments.js
 */

(async () => {
  const base = process.env.API_BASE || "http://localhost:8080";

  try {
    // Login as admin
    const loginRes = await fetch(base + "/api/users/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: "andi", password: "Andi@1986" }),
    });

    const token = await loginRes.text();
    const setCookie = loginRes.headers.get("set-cookie") || loginRes.headers.get("Set-Cookie");

    if (!token) {
      console.error("❌ No token received; aborting");
      process.exit(1);
    }

    const authHeader = {
      Authorization: "Bearer " + token,
      "content-type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Origin: "http://localhost:5173",
    };
    const cookieHeader = setCookie ? { Cookie: setCookie.split(";")[0] } : {};

    console.log("✓ Logged in successfully");

    // Fetch existing departments
    const listRes = await fetch(base + "/api/departments", {
      headers: { ...authHeader, ...cookieHeader },
    });

    const existing = await listRes.json().catch(() => []);
    console.log(`✓ Found ${Array.isArray(existing) ? existing.length : 0} existing departments`);

    // Default departments to create
    const defaultDepts = [
      { name: "Ushers", description: "Ushering and hospitality ministry" },
      { name: "Music & Worship", description: "Music, worship, and praise team" },
      { name: "Children Ministry", description: "Children Sunday school and activities" },
      { name: "Youth Ministry", description: "Youth group and young adults" },
      { name: "Finance", description: "Finance and giving management" },
      { name: "Outreach", description: "Community outreach and missions" },
    ];

    // Create missing departments
    for (const dept of defaultDepts) {
      const exists =
        Array.isArray(existing) &&
        existing.some((d) => d.name.toLowerCase() === dept.name.toLowerCase());

      if (!exists) {
        try {
          const createRes = await fetch(base + "/api/departments", {
            method: "POST",
            headers: { ...authHeader, ...cookieHeader },
            body: JSON.stringify(dept),
          });

          const result = await createRes.json().catch(() => null);
          if (createRes.status === 201 || createRes.status === 200) {
            console.log(`✓ Created department: ${dept.name}`);
          } else {
            console.log(`⚠ Failed to create ${dept.name} (status: ${createRes.status})`);
          }
        } catch (e) {
          console.error(`✗ Error creating ${dept.name}:`, e.message);
        }
      } else {
        console.log(`ℹ Department already exists: ${dept.name}`);
      }
    }

    // List all departments
    const finalRes = await fetch(base + "/api/departments", {
      headers: { ...authHeader, ...cookieHeader },
    });
    const finalList = await finalRes.json().catch(() => []);

    console.log("\n✓ Final department list:");
    if (Array.isArray(finalList)) {
      finalList.forEach((d) => console.log(`  - ${d.name}: ${d.description || "No description"}`));
      console.log(`\nTotal: ${finalList.length} departments`);
    }
  } catch (err) {
    console.error("✗ Error:", err.message);
    process.exit(1);
  }
})();
