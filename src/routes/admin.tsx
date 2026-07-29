import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, UserResponse, Sermon, Department, GivingEntry } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Elshaddai Ministries" }] }),
  component: Admin,
});

function Admin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedCard, setSelectedCard] = useState<"members" | "sermons" | "departments" | "gifts">(
    "members",
  );
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(null);
  const [memberComposerOpen, setMemberComposerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserResponse | null>(null);
  const [memberFormMessage, setMemberFormMessage] = useState("");
  const [memberFormError, setMemberFormError] = useState("");
  const [departmentComposerOpen, setDepartmentComposerOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => api<UserResponse[]>("/api/users", { auth: true }),
    enabled: user?.role === "ADMIN",
  });
  const sermons = useQuery({
    queryKey: ["sermons"],
    queryFn: () => api<Sermon[]>("/api/sermons", { auth: true }),
    enabled: user?.role === "ADMIN",
  });
  const depts = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("/api/departments", { auth: true }),
    enabled: user?.role === "ADMIN",
  });
  const giving = useQuery({
    queryKey: ["giving"],
    queryFn: () => api<GivingEntry[]>("/api/giving/admin", { auth: true }),
    enabled: user?.role === "ADMIN",
  });

  const saveDepartment = useMutation({
    mutationFn: async (payload: Partial<Department> & { id?: number }) => {
      if (payload.id) {
        return api(`/api/departments/admin/update/${payload.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: payload.name ?? "",
            description: payload.description ?? "",
          }),
          auth: true,
        });
      }
      return api("/api/departments/admin/create", {
        method: "POST",
        body: JSON.stringify({
          name: payload.name ?? "",
          description: payload.description ?? "",
        }),
        auth: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setDepartmentComposerOpen(false);
      setEditingDepartment(null);
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: async (id: number) =>
      api(`/api/departments/admin/delete/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      setDepartmentComposerOpen(false);
      setEditingDepartment(null);
    },
  });

  const saveMember = useMutation({
    mutationFn: async (payload: Record<string, string | number | undefined>) => {
      if (payload.id) {
        return api(`/api/users/admin/update/${payload.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
          auth: true,
        });
      }
      return api("/api/users/register", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setMemberComposerOpen(false);
      setEditingMember(null);
      setSelectedMember(null);
      setMemberFormMessage("Member saved successfully");
      setMemberFormError("");
      setTimeout(() => setMemberFormMessage(""), 3000);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      setMemberFormError(message || "Could not save member. Please try again.");
      setMemberFormMessage("");
      console.error("Member save failed:", error);
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: number) => api(`/api/users/admin/delete/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setSelectedMember(null);
      setEditingMember(null);
      setMemberComposerOpen(false);
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Admins only</h1>
        <p className="mt-4 text-muted-foreground">Please sign in with an admin account.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-primary">Access denied</h1>
        <p className="mt-4 text-muted-foreground">Your account doesn't have admin privileges.</p>
      </div>
    );
  }

  const cards = [
    {
      key: "members" as const,
      label: "Members",
      value: users.data?.length ?? "—",
      detail: "Active members",
    },
    {
      key: "sermons" as const,
      label: "Sermons",
      value: sermons.data?.length ?? "—",
      detail: "Published messages",
    },
    {
      key: "departments" as const,
      label: "Departments",
      value: depts.data?.length ?? "—",
      detail: "Ministry groups",
    },
    {
      key: "gifts" as const,
      label: "Gifts Recorded",
      value: giving.data?.length ?? "—",
      detail: "Recent offerings",
    },
  ];

  const detailItems = {
    members: (users.data ?? []).map((u) => ({
      title: `${u.name} ${u.surname}`.trim(),
      subtitle: `${u.email} • ${u.role}`,
    })),
    sermons: (sermons.data ?? []).map((s) => ({
      title: s.title,
      subtitle: `${s.preacher} • ${s.date}`,
    })),
    departments: (depts.data ?? []).map((d) => ({
      title: d.name,
      subtitle: d.description || "No description provided",
    })),
    gifts: (giving.data ?? []).map((g) => ({
      title: [g?.name, g?.surname, g?.giverName].filter(Boolean).join(" ").trim() || "Anonymous",
      subtitle: `R ${g.amount} • ${g.paymentMethod || "Unspecified"} • ${g.dateTime?.slice(0, 10) || "Unknown date"}`,
    })),
  };

  const selectedCardData = cards.find((card) => card.key === selectedCard) ?? cards[0];
  const selectedDetails = detailItems[selectedCard];
  const memberDepartmentName = (member: UserResponse) => {
    const direct = member.departmentName || member.department;
    return direct ? String(direct) : "Unassigned";
  };
  const memberLastActive = (member: UserResponse) => {
    return member.lastActiveAt || member.lastActive || "No activity recorded";
  };
  const watchedSermons = (member: UserResponse) => {
    const list = member.watchedSermons || member.sermonsWatched || [];
    return Array.isArray(list) ? list : [];
  };
  const memberGiving = (member: UserResponse) => {
    const fromMember = member.giving || member.gifts || [];
    if (Array.isArray(fromMember) && fromMember.length) return fromMember;
    return (giving.data ?? []).filter((entry: GivingEntry) => {
      const userId = entry?.userId ?? entry?.memberId ?? entry?.user?.id;
      if (userId && member.id && Number(userId) === Number(member.id)) return true;
      const matchName = [entry?.name, entry?.surname, entry?.giverName]
        .filter(Boolean)
        .join(" ")
        .trim();
      const currentName = [member.name, member.surname].filter(Boolean).join(" ").trim();
      return Boolean(
        matchName && currentName && matchName.toLowerCase() === currentName.toLowerCase(),
      );
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="font-display text-5xl text-primary">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Overview of ministry activity.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-4">
        {cards.map((c) => {
          const isActive = c.key === selectedCard;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setSelectedCard(c.key)}
              className={`rounded-xl border p-6 text-left transition-colors ${
                isActive ? "border-gold bg-primary/5" : "border-border bg-card hover:border-gold/60"
              }`}
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <p className="text-xs uppercase tracking-wider text-gold">{c.label}</p>
              <p className="mt-2 font-display text-4xl text-primary">{c.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.detail}</p>
            </button>
          );
        })}
      </div>

      <section
        className="mt-8 rounded-xl border border-border bg-card p-6"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gold">{selectedCardData.label}</p>
            <h2 className="font-display text-2xl text-primary">{selectedCardData.detail}</h2>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
            {selectedCardData.value} active
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {selectedCard === "members" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Manage active members, their roles, and ministry activity.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setMemberComposerOpen(true);
                  }}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  + Add Member
                </button>
              </div>

              {memberComposerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
                    {memberFormMessage && (
                      <div className="mb-4 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white">
                        {memberFormMessage}
                      </div>
                    )}
                    {memberFormError && (
                      <div className="mb-4 rounded-2xl bg-destructive px-4 py-3 text-sm font-medium text-white">
                        {memberFormError}
                      </div>
                    )}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {editingMember ? "Edit member" : "Add member"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          {editingMember
                            ? "Update the member details below."
                            : "Create a new member account for the ministry."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMemberComposerOpen(false);
                          setEditingMember(null);
                        }}
                        className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget as HTMLFormElement);
                        const passwordValue = (fd.get("password") as string)?.trim();
                        const payload: Record<string, string | number | undefined> = {
                          id: editingMember?.id,
                          name: (fd.get("name") as string) || "",
                          surname: (fd.get("surname") as string) || "",
                          email: (fd.get("email") as string) || "",
                          username: (fd.get("username") as string) || "",
                          role: (fd.get("role") as string) || "USER",
                          department: (fd.get("department") as string) || "",
                        };
                        if (passwordValue) {
                          payload.password = passwordValue;
                        } else if (!editingMember) {
                          payload.password = "Welcome123!";
                        }
                        saveMember.mutate(payload);
                      }}
                      className="mt-6 space-y-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm">First name</label>
                          <input
                            name="name"
                            defaultValue={editingMember?.name ?? ""}
                            className="w-full rounded border px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm">Surname</label>
                          <input
                            name="surname"
                            defaultValue={editingMember?.surname ?? ""}
                            className="w-full rounded border px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm">Email</label>
                          <input
                            name="email"
                            type="email"
                            defaultValue={editingMember?.email ?? ""}
                            className="w-full rounded border px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm">Username</label>
                          <input
                            name="username"
                            defaultValue={editingMember?.username ?? ""}
                            className="w-full rounded border px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm">Password</label>
                          <input
                            name="password"
                            type="password"
                            defaultValue={editingMember ? "" : "Welcome123!"}
                            className="w-full rounded border px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm">Role</label>
                          <select
                            name="role"
                            defaultValue={editingMember?.role ?? "USER"}
                            className="w-full rounded border px-2 py-1"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-sm">Department</label>
                          <input
                            name="department"
                            defaultValue={
                              editingMember?.departmentName || editingMember?.department || ""
                            }
                            className="w-full rounded border px-2 py-1"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMemberComposerOpen(false);
                            setEditingMember(null);
                          }}
                          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saveMember.isPending}
                          className={`rounded px-4 py-2 text-sm font-medium text-primary-foreground transition ${
                            saveMember.isPending
                              ? "bg-primary/70 cursor-not-allowed"
                              : "bg-primary hover:bg-primary/90"
                          }`}
                        >
                          {saveMember.isPending
                            ? editingMember
                              ? "Updating..."
                              : "Creating..."
                            : editingMember
                            ? "Update Member"
                            : "Create Member"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(users.data ?? []).map((member) => (
                  <div
                    key={member.id}
                    className="rounded-lg border border-border bg-background/70 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {member.name} {member.surname}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {member.email} • {member.role}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Department: {memberDepartmentName(member)} • Last active:{" "}
                          {memberLastActive(member)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMember(member);
                            setEditingMember(null);
                          }}
                          className="rounded border px-3 py-2 text-sm"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMember(member);
                            setMemberComposerOpen(true);
                          }}
                          className="rounded border px-3 py-2 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ${member.name} ${member.surname}?`))
                              deleteMember.mutate(member.id);
                          }}
                          className="rounded border px-3 py-2 text-sm text-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {selectedMember?.id === member.id && (
                      <div className="mt-4 rounded-md border border-border bg-card/70 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gold">Role</p>
                            <p className="mt-1 text-sm text-foreground">{member.role}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gold">
                              Department
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {memberDepartmentName(member)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gold">
                              Last active
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {memberLastActive(member)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gold">Giving</p>
                            <p className="mt-1 text-sm text-foreground">
                              {memberGiving(member).length} recorded gifts
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-gold">
                            Sermons watched
                          </p>
                          <div className="mt-2 space-y-2">
                            {watchedSermons(member).length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No sermon activity recorded yet.
                              </p>
                            )}
                            {watchedSermons(member).map((item, index) => {
                              const title =
                                typeof item === "string" ? item : item?.title || "Untitled sermon";
                              const date = typeof item === "string" ? "" : item?.date || "";
                              return (
                                <div
                                  key={`${title}-${index}`}
                                  className="rounded border border-border px-3 py-2 text-sm text-muted-foreground"
                                >
                                  <div className="font-medium text-foreground">{title}</div>
                                  {date && <div className="mt-1 text-xs">{date}</div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-gold">
                            Recent giving
                          </p>
                          <div className="mt-2 space-y-2">
                            {memberGiving(member).length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No giving recorded yet.
                              </p>
                            )}
                            {memberGiving(member)
                              .slice(0, 4)
                              .map((entry, index) => (
                                <div
                                  key={`${entry?.id ?? index}`}
                                  className="rounded border border-border px-3 py-2 text-sm text-muted-foreground"
                                >
                                  <div className="font-medium text-foreground">
                                    R {entry?.amount ?? entry?.total ?? "—"}
                                  </div>
                                  <div className="mt-1 text-xs">
                                    {entry?.paymentMethod ||
                                      entry?.method ||
                                      "Payment method unavailable"}{" "}
                                    •{" "}
                                    {entry?.dateTime?.slice(0, 10) || entry?.date || "Unknown date"}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCard === "departments" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage departments on the dedicated departments page.
              </p>
              <Link
                to="/admin/departments"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Go to Departments
              </Link>
              <div className="space-y-3">
                {(depts.data ?? []).map((department) => (
                  <div
                    key={department.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-background/70 p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{department.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {department.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCard !== "members" &&
            selectedCard !== "departments" &&
            selectedDetails.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No {selectedCardData.label.toLowerCase()} available yet.
              </p>
            )}

          {selectedCard !== "members" &&
            selectedCard !== "departments" &&
            selectedDetails.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-lg border border-border bg-background/70 p-4"
              >
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-primary">Recent Giving</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Giver</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {giving.data?.map((g, i) => {
                const giverName =
                  [g?.name, g?.surname, g?.giverName].filter(Boolean).join(" ").trim() ||
                  "Anonymous";
                const details =
                  g?.details || g?.note || g?.description || g?.purpose || "No details provided";

                return (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3">{g.dateTime?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{giverName}</div>
                      {details && <div className="text-xs text-muted-foreground">{details}</div>}
                    </td>
                    <td className="px-4 py-3">{g.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-medium">R {g.amount}</td>
                  </tr>
                );
              })}
              {giving.data && giving.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No gifts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
