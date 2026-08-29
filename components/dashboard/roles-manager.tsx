"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  RoleDefinition,
  AdminMember,
  PermissionKey,
  ALL_PERMISSIONS,
  SYSTEM_ROLES,
  INITIAL_ADMIN_MEMBERS,
} from "@/lib/roles";
import {
  Shield,
  Users,
  UserPlus,
  Lock,
  Check,
  X,
  Trash2,
  Key,
  Sliders,
  Activity,
  Plus,
  Ban,
  UserCheck,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export function RolesManager() {
  const [roles, setRoles] = useState<RoleDefinition[]>(SYSTEM_ROLES);
  const [members, setMembers] = useState<AdminMember[]>(INITIAL_ADMIN_MEMBERS);
  const [activeTab, setActiveTab] = useState<"members" | "matrix" | "audit">("members");
  const [simulatedRoleId, setSimulatedRoleId] = useState<string>("super_admin");
  const [isSaved, setIsSaved] = useState(false);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("editorial_director");

  // Create Role Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleBadge, setNewRoleBadge] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<PermissionKey[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedRoles = localStorage.getItem("layerat_admin_roles");
      const storedMembers = localStorage.getItem("layerat_admin_members");
      if (storedRoles) setRoles(JSON.parse(storedRoles));
      if (storedMembers) setMembers(JSON.parse(storedMembers));
    } catch (e) {
      console.error("Failed to load RBAC data from storage:", e);
    }
  }, []);

  const saveRoles = (newRoles: RoleDefinition[]) => {
    setRoles(newRoles);
    localStorage.setItem("layerat_admin_roles", JSON.stringify(newRoles));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const saveMembers = (newMembers: AdminMember[]) => {
    setMembers(newMembers);
    localStorage.setItem("layerat_admin_members", JSON.stringify(newMembers));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleToggleMemberSuspend = (id: string) => {
    const updated = members.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: m.status === "suspended" ? ("active" as const) : ("suspended" as const),
        };
      }
      return m;
    });
    saveMembers(updated);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to revoke admin privileges and remove this team member?")) {
      const updated = members.filter((m) => m.id !== id);
      saveMembers(updated);
    }
  };

  const handleRoleChange = (memberId: string, newRoleId: string) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, roleId: newRoleId };
      }
      return m;
    });
    saveMembers(updated);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: AdminMember = {
      id: `admin-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      username: inviteEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_"),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      roleId: inviteRoleId,
      status: "active",
      lastActive: "Invited just now",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveMembers([...members, newMember]);
    setInviteName("");
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      badge: newRoleBadge.trim().toUpperCase() || "CUSTOM",
      description: newRoleDesc.trim() || "Custom assigned role permissions.",
      isSystem: false,
      permissions: newRolePerms,
    };

    saveRoles([...roles, newRole]);
    setNewRoleName("");
    setNewRoleBadge("");
    setNewRoleDesc("");
    setNewRolePerms([]);
    setIsCreateRoleModalOpen(false);
  };

  const handleToggleRolePermission = (roleId: string, permKey: PermissionKey) => {
    const updated = roles.map((r) => {
      if (r.id === roleId) {
        const has = r.permissions.includes(permKey);
        return {
          ...r,
          permissions: has
            ? r.permissions.filter((p) => p !== permKey)
            : [...r.permissions, permKey],
        };
      }
      return r;
    });
    saveRoles(updated);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top RBAC Banner */}
      <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Role-Based Access Control & Admin Governance
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.2 text-[9px] font-mono font-bold uppercase">
                RBAC v2.0
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage internal administrators, define role permissions, and restrict dashboard access per department.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Simulate Role Selector */}
          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Simulate:</span>
            <select
              value={simulatedRoleId}
              onChange={(e) => setSimulatedRoleId(e.target.value)}
              className="bg-transparent font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-black text-neutral-900 dark:text-neutral-100">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateRoleModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>+ New Role</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Invite Admin</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: "members" as const, label: `Admin Team (${members.length})`, icon: Users },
          { id: "matrix" as const, label: `Permissions Matrix (${roles.length} Roles)`, icon: Key },
          { id: "audit" as const, label: "Security & Audit Log", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ADMIN MEMBERS DIRECTORY */}
      {activeTab === "members" && (
        <div className="overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-4">Administrator Identity</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Granted Modules</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {members.map((member) => {
                  const role = roles.find((r) => r.id === member.roleId) || roles[0];
                  const isSuperAdmin = member.roleId === "super_admin";
                  const isSuspended = member.status === "suspended";

                  return (
                    <tr
                      key={member.id}
                      className={cn(
                        "group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40",
                        isSuspended && "opacity-60 bg-neutral-100 dark:bg-neutral-900"
                      )}
                    >
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-800">
                            <Image
                              src={getValidAvatarUrl(member.avatarUrl)}
                              alt={member.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isSuperAdmin && (
                                <span className="rounded bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase">
                                  Root
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono truncate">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={member.roleId}
                          disabled={isSuperAdmin}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="rounded-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2.5 py-1 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none disabled:opacity-80 cursor-pointer"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.badge})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Granted Modules Pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {isSuperAdmin ? (
                            <span className="rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-900 dark:text-neutral-100">
                              ★ All Modules (Full Access)
                            </span>
                          ) : (
                            role.permissions.slice(0, 3).map((p) => {
                              const label = ALL_PERMISSIONS.find((item) => item.key === p)?.module || p;
                              return (
                                <span
                                  key={p}
                                  className="rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                  {label}
                                </span>
                              );
                            })
                          )}
                          {!isSuperAdmin && role.permissions.length > 3 && (
                            <span className="rounded-md bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
                              +{role.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold",
                            isSuspended
                              ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                              : "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", isSuspended ? "bg-neutral-400" : "bg-black dark:bg-white")} />
                          <span>{isSuspended ? "Suspended" : "Active"}</span>
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-xs font-mono text-neutral-500">
                        {member.lastActive}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleMemberSuspend(member.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                              title={isSuspended ? "Unsuspend Admin" : "Suspend Admin"}
                            >
                              {isSuspended ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                              title="Remove Admin"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400 italic">Master Root</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PERMISSIONS MATRIX */}
      {activeTab === "matrix" && (
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Granular Permissions & Feature Access Matrix
              </h3>
              <p className="text-xs text-neutral-500">
                Toggle exact permission capabilities for each administrator role.
              </p>
            </div>
            {isSaved && (
              <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-xs font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Permissions Saved!</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4 min-w-[200px]">Permission Feature</th>
                  <th className="py-3 px-4">Module</th>
                  {roles.map((r) => (
                    <th key={r.id} className="py-3 px-4 text-center min-w-[120px]">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{r.name}</div>
                      <div className="text-[9px] font-mono text-neutral-400">[{r.badge}]</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {ALL_PERMISSIONS.map((perm) => (
                  <tr key={perm.key} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{perm.label}</div>
                      <div className="text-[10px] text-neutral-400">{perm.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-700 dark:text-neutral-300">
                        {perm.module}
                      </span>
                    </td>

                    {roles.map((r) => {
                      const hasPerm = r.permissions.includes(perm.key);
                      const isSuper = r.id === "super_admin";

                      return (
                        <td key={r.id} className="py-3 px-4 text-center">
                          <button
                            type="button"
                            disabled={isSuper}
                            onClick={() => handleToggleRolePermission(r.id, perm.key)}
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-lg border transition-all cursor-pointer",
                              hasPerm
                                ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                                : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-400 opacity-40 hover:opacity-100",
                              isSuper && "cursor-not-allowed opacity-100 bg-black text-white dark:bg-white dark:text-black"
                            )}
                            title={isSuper ? "Super Admin inherently possesses all permissions" : "Toggle permission"}
                          >
                            {hasPerm ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Administrative Security & Audit Log
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Immutable Record</span>
          </div>

          <div className="space-y-3">
            {[
              { actor: "Ahmed Al-Azaiza (Super Admin)", action: "Invited Kareem to Community & Critique Lead role", time: "10 minutes ago", ip: "192.168.1.101" },
              { actor: "Ameera Hamada (Curator)", action: "Featured 'Kinetics Interface System' monograph on Staff Picks", time: "1 hour ago", ip: "82.114.16.22" },
              { actor: "Ahmed Al-Azaiza (Super Admin)", action: "Updated Homepage Hero CMS headline and published live", time: "2 hours ago", ip: "192.168.1.101" },
              { actor: "System Engine", action: "PostgreSQL Database Backup exported (JSON schema)", time: "Yesterday at 22:30", ip: "Internal" },
              { actor: "Ahmed Al-Azaiza (Super Admin)", action: "Granted Verified Studio Badge to creator @nour_design", time: "2 days ago", ip: "192.168.1.101" },
            ].map((log, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 rounded-[14px] bg-neutral-50 dark:bg-neutral-900 p-3 border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">{log.action}</div>
                  <div className="text-[11px] text-neutral-500">
                    By: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{log.actor}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[10px] text-neutral-400">{log.time}</div>
                  <div className="font-mono text-[9px] text-neutral-400 opacity-80">{log.ip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: INVITE ADMIN MEMBER */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Invite Administrator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Admin Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. sarah@layerat.com"
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Assigned Administrative Role *
                </label>
                <select
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(e.target.value)}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — [{r.badge}]
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 pt-0.5">
                  {roles.find((r) => r.id === inviteRoleId)?.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Send Admin Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CUSTOM ROLE */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Create Custom Administrator Role
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateRoleModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Media Asset Reviewer"
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Badge Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleBadge}
                    onChange={(e) => setNewRoleBadge(e.target.value)}
                    placeholder="e.g. ASSETS"
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Role Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Outline responsibilities..."
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              {/* Granted Permissions Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Granted Dashboard Module Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = newRolePerms.includes(p.key);
                    return (
                      <label
                        key={p.key}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-[10px] border text-xs cursor-pointer transition-colors",
                          isChecked
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) setNewRolePerms(newRolePerms.filter((k) => k !== p.key));
                            else setNewRolePerms([...newRolePerms, p.key]);
                          }}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold truncate">{p.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
