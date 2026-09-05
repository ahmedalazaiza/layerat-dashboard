"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RoleDefinition,
  AdminMember,
  PermissionKey,
  ALL_PERMISSIONS,
  SYSTEM_ROLES,
  DEFAULT_CUSTOM_ROLES,
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
  Edit3,
  Layers,
  Search,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";
import { UserRole } from "@/lib/types";
import { isSuperAdminEmail } from "@/lib/auth-security";
import {
  fetchAdminMembersFromDb,
  updateAdminUserRoleInDb,
  deleteAdminUserInDb,
  toggleAdminUserStatusInDb,
} from "@/lib/supabase/queries";

export function RolesManager() {
  const {
    adminUsers,
    creators,
    updateUserRole,
    toggleUserSuspended: toggleDbSuspended,
    confirmAction,
  } = useSession();

  // Roles State (Loaded from localStorage or initialized with system + default custom roles)
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("layerat_admin_roles");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored roles:", e);
      }
    }
    return [...SYSTEM_ROLES, ...DEFAULT_CUSTOM_ROLES];
  });

  // Admin Team Members State (Strictly staff with elevated permissions)
  const [members, setMembers] = useState<AdminMember[]>(INITIAL_ADMIN_MEMBERS);
  const [activeTab, setActiveTab] = useState<"members" | "custom_roles" | "matrix" | "audit">("members");
  const [simulatedRoleId, setSimulatedRoleId] = useState<string>("super_admin");
  const [isSaved, setIsSaved] = useState(false);

  // Search Filters
  const [memberSearch, setMemberSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<"promote" | "email">("promote");
  const [promoteSearch, setPromoteSearch] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("editorial_director");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  // Create Custom Role Form State
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleBadge, setNewRoleBadge] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<PermissionKey[]>([]);

  // Edit Custom Role Form State
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  // Synchronize Live Supabase Staff Members
  useEffect(() => {
    // Load custom roles map from localStorage if present
    let localRolesMap: Record<string, string> = {};
    try {
      const stored = localStorage.getItem("layerat_member_roles_map");
      if (stored) localRolesMap = JSON.parse(stored);
    } catch (e) {}

    if (adminUsers && adminUsers.length > 0) {
      // STRICT FILTER: Only include users with elevated administrative roles!
      // Regular creators (role === "member" or undefined) stay exclusively in the Creators directory!
      const elevatedUsers = adminUsers.filter((u) => {
        const isSuper =
          isSuperAdminEmail(u.email) ||
          u.id === "2d6ea33a-fc53-4b4c-bf82-40db29b3b998" ||
          u.customBadge === "SuperAdmin";
        if (isSuper) return true;
        return u.role === "admin" || u.role === "curator" || u.role === "moderator";
      });

      if (elevatedUsers.length > 0) {
        const mapped: AdminMember[] = elevatedUsers.map((u) => {
          const isSuper =
            isSuperAdminEmail(u.email) ||
            u.id === "2d6ea33a-fc53-4b4c-bf82-40db29b3b998" ||
            u.customBadge === "SuperAdmin";

          let roleId = "editorial_director";
          if (localRolesMap[u.id]) {
            roleId = localRolesMap[u.id];
          } else if (isSuper) {
            roleId = "super_admin";
          } else if (u.role === "admin") {
            roleId = "platform_admin";
          } else if (u.role === "curator") {
            roleId = "editorial_director";
          } else if (u.role === "moderator") {
            roleId = "community_moderator";
          }

          return {
            id: u.id,
            name: u.displayName || u.username,
            email: u.email || `${u.username}@layerat.com`,
            username: u.username,
            avatarUrl: u.avatarUrl,
            roleId,
            status: u.isSuspended ? "suspended" : "active",
            lastActive: isSuper ? "Active now" : u.isOnline ? "Online now" : "Recently active",
            createdAt: u.createdAt || "2026-09-01",
          };
        });

        // Super Admin (Root) anchored at top
        mapped.sort((a, b) => (a.roleId === "super_admin" ? -1 : b.roleId === "super_admin" ? 1 : 0));
        setMembers(mapped);
      } else {
        setMembers(INITIAL_ADMIN_MEMBERS);
      }
    } else {
      try {
        const storedMembers = localStorage.getItem("layerat_admin_members");
        if (storedMembers) setMembers(JSON.parse(storedMembers));
      } catch (e) {}
    }
  }, [adminUsers]);

  // Persistence Helpers
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

  // Custom Roles & System Roles Categorization
  const customRoles = useMemo(() => roles.filter((r) => !r.isSystem), [roles]);
  const systemRoles = useMemo(() => roles.filter((r) => r.isSystem), [roles]);

  // Filtered lists
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        roles.find((r) => r.id === m.roleId)?.name.toLowerCase().includes(q)
    );
  }, [members, memberSearch, roles]);

  const filteredCustomRoles = useMemo(() => {
    if (!roleSearch.trim()) return customRoles;
    const q = roleSearch.toLowerCase();
    return customRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.badge.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [customRoles, roleSearch]);

  // Candidates for Admin Promotion (Creators not yet in admin team)
  const eligibleCreators = useMemo(() => {
    const adminIds = new Set(members.map((m) => m.id));
    const list = creators.filter((c) => !adminIds.has(c.id));
    if (!promoteSearch.trim()) return list;
    const q = promoteSearch.toLowerCase();
    return list.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        (c.city || "").toLowerCase().includes(q)
    );
  }, [creators, members, promoteSearch]);

  // Handlers
  const handleToggleMemberSuspend = async (id: string) => {
    const target = members.find((m) => m.id === id);
    if (!target) return;
    const isNowSuspended = target.status !== "suspended";

    const ok = await confirmAction({
      title: isNowSuspended ? "Suspend Admin Access?" : "Reactivate Admin Access?",
      description: isNowSuspended
        ? `Suspend administrative privileges for ${target.name}? They will immediately be locked out of the dashboard governance panel.`
        : `Restore active administrative access for ${target.name}?`,
      confirmText: isNowSuspended ? "Suspend Access" : "Reactivate Access",
      variant: isNowSuspended ? "destructive" : "default",
      targetName: target.name,
      targetDetails: target.email,
    });
    if (!ok) return;

    const updated = members.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: isNowSuspended ? ("suspended" as const) : ("active" as const),
        };
      }
      return m;
    });
    saveMembers(updated);
    await toggleDbSuspended(id, isNowSuspended);
  };

  const handleDeleteMember = async (id: string) => {
    const target = members.find((m) => m.id === id);
    if (!target || target.roleId === "super_admin") return;

    const ok = await confirmAction({
      title: "Revoke Administrative Privileges?",
      description: `Revoke admin access from ${target.name}? Their account will return to a standard community creator profile on Layerat, and their admin console access will be revoked immediately.`,
      confirmText: "Revoke Privileges",
      variant: "destructive",
      targetName: target.name,
      targetDetails: target.email,
      badgeLabel: "Privilege Revocation",
    });
    if (!ok) return;

    const updated = members.filter((m) => m.id !== id);
    saveMembers(updated);

    await deleteAdminUserInDb(id);
    await updateUserRole(id, "member");
  };

  const handleRoleChange = async (memberId: string, newRoleId: string) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, roleId: newRoleId };
      }
      return m;
    });
    saveMembers(updated);

    // Persist custom role mapping locally
    try {
      const stored = localStorage.getItem("layerat_member_roles_map") || "{}";
      const parsed = JSON.parse(stored);
      parsed[memberId] = newRoleId;
      localStorage.setItem("layerat_member_roles_map", JSON.stringify(parsed));
    } catch (e) {}

    let mappedDbRole: UserRole = "admin";
    if (newRoleId === "editorial_director" || newRoleId === "curator") mappedDbRole = "curator";
    else if (newRoleId === "community_moderator") mappedDbRole = "moderator";
    else if (newRoleId === "member") mappedDbRole = "member";
    else mappedDbRole = "admin";

    await updateAdminUserRoleInDb(memberId, newRoleId);
    await updateUserRole(memberId, mappedDbRole);
  };

  // Promote Existing Creator to Admin Staff
  const handlePromoteCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId) return;

    const targetCreator = creators.find((c) => c.id === selectedCreatorId);
    if (!targetCreator) return;

    const roleObj = roles.find((r) => r.id === selectedRoleId) || roles[0];

    const ok = await confirmAction({
      title: `Promote @${targetCreator.username} to Admin Staff?`,
      description: `Elevate ${targetCreator.displayName || targetCreator.username} to administrator with role "${roleObj.name}"? They will gain access to manage platform operations and assigned modules.`,
      confirmText: "Promote to Admin",
      variant: "default",
      targetName: targetCreator.displayName || targetCreator.username,
      targetDetails: `@${targetCreator.username} • Role: ${roleObj.name} [${roleObj.badge}]`,
      badgeLabel: "Admin Promotion",
    });
    if (!ok) return;

    let mappedDbRole: UserRole = "admin";
    if (selectedRoleId === "editorial_director" || selectedRoleId === "curator") mappedDbRole = "curator";
    else if (selectedRoleId === "community_moderator") mappedDbRole = "moderator";
    else mappedDbRole = "admin";

    await updateAdminUserRoleInDb(targetCreator.id, selectedRoleId);
    await updateUserRole(targetCreator.id, mappedDbRole);

    const newAdminMember: AdminMember = {
      id: targetCreator.id,
      name: targetCreator.displayName || targetCreator.username,
      email: targetCreator.email || `${targetCreator.username}@layerat.com`,
      username: targetCreator.username,
      avatarUrl: targetCreator.avatarUrl,
      roleId: selectedRoleId,
      status: "active",
      lastActive: targetCreator.isOnline ? "Online now" : "Active today",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveMembers([...members.filter((m) => m.id !== targetCreator.id), newAdminMember]);

    try {
      const stored = localStorage.getItem("layerat_member_roles_map") || "{}";
      const parsed = JSON.parse(stored);
      parsed[targetCreator.id] = selectedRoleId;
      localStorage.setItem("layerat_member_roles_map", JSON.stringify(parsed));
    } catch (err) {}

    setSelectedCreatorId("");
    setIsInviteModalOpen(false);
  };

  // Invite Admin via Email Form Submit
  const handleInviteEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: AdminMember = {
      id: `admin-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      username: inviteEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_"),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      roleId: selectedRoleId,
      status: "active",
      lastActive: "Invited just now",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveMembers([...members, newMember]);
    setInviteName("");
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };

  // Create Role Form Submit
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      badge: newRoleBadge.trim().toUpperCase() || "CUSTOM",
      description: newRoleDesc.trim() || "Admin-created custom role permissions.",
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

  // Edit Role Handlers
  const handleOpenEditRole = (role: RoleDefinition) => {
    setEditingRole({ ...role, permissions: [...role.permissions] });
    setIsEditRoleModalOpen(true);
  };

  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    const updatedRoles = roles.map((r) => (r.id === editingRole.id ? editingRole : r));
    saveRoles(updatedRoles);
    setIsEditRoleModalOpen(false);
    setEditingRole(null);
  };

  // Delete Custom Role
  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.isSystem) return;

    const assignedMembers = members.filter((m) => m.roleId === roleId);

    const ok = await confirmAction({
      title: `Delete Custom Role "${role.name}"?`,
      description:
        assignedMembers.length > 0
          ? `This custom role is currently assigned to ${assignedMembers.length} admin member(s). Deleting it will automatically reassign those members to Editorial Director / Curator.`
          : `Are you sure you want to permanently delete the custom role "${role.name}"? This action cannot be undone.`,
      confirmText: "Delete Role",
      variant: "destructive",
      targetName: role.name,
      targetDetails: `Badge: [${role.badge}] • ${role.permissions.length} Granted Permissions`,
      badgeLabel: "Role Deletion",
    });
    if (!ok) return;

    const nextRoles = roles.filter((r) => r.id !== roleId);
    saveRoles(nextRoles);

    if (assignedMembers.length > 0) {
      const nextMembers = members.map((m) =>
        m.roleId === roleId ? { ...m, roleId: "editorial_director" } : m
      );
      saveMembers(nextMembers);
    }
  };

  // Permissions Matrix Toggle
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
      {/* Top Header Card */}
      <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Admin Team &amp; Role Governance
              </h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 text-[9px] font-mono font-bold uppercase">
                RBAC v2.0
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage internal platform staff, configure admin-created custom roles, and define module access matrix.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Role Simulator */}
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
            onClick={() => {
              setInviteMode("promote");
              setIsInviteModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Promote / Invite Admin</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: "members" as const, label: `Admin Team (${members.length})`, icon: Users },
          { id: "custom_roles" as const, label: `Admin-Created Roles (${customRoles.length})`, icon: Sliders },
          { id: "matrix" as const, label: `Permissions Matrix (${roles.length})`, icon: Key },
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

      {/* ========================================================================= */}
      {/* 1. ADMIN STAFF MEMBERS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Member Search Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search admin staff by name, email, or role..."
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black pl-9 pr-8 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => setMemberSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-neutral-400 font-mono">
              Showing <span className="font-bold text-neutral-900 dark:text-neutral-100">{filteredMembers.length}</span> staff members
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    <th className="py-3.5 px-4">Administrator Identity</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Granted Modules</th>
                    <th className="py-3.5 px-4">Access Status</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Staff Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                        No admin staff found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
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
                            <div className="flex items-center gap-3 min-w-[220px]">
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
                                  {!role.isSystem && (
                                    <span className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 px-1 py-0.2 text-[8px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
                                      Custom
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
                              <optgroup label="System Roles">
                                {systemRoles.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} [{r.badge}]
                                  </option>
                                ))}
                              </optgroup>
                              {customRoles.length > 0 && (
                                <optgroup label="Admin-Created Roles">
                                  {customRoles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.name} [{r.badge}]
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </td>

                          {/* Granted Modules Pills */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {isSuperAdmin ? (
                                <span className="rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                  ★ Full Platform Master Access
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
                              <span>{isSuspended ? "Suspended" : "Active Access"}</span>
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
                                  title={isSuspended ? "Unsuspend Admin Access" : "Suspend Admin Access"}
                                >
                                  {isSuspended ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                  title="Revoke Admin Privileges (Revert to Creator)"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-400 italic">Root Authority</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN-CREATED ROLES GALLERY (Dedicated Page View) */}
      {/* ========================================================================= */}
      {activeTab === "custom_roles" && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Roles Created by Administrator</span>
                <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 text-xs font-mono font-bold">
                  {customRoles.length} Custom Profiles
                </span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Tailored administrative roles created by the super admin with customized permission boundaries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Filter custom roles..."
                  className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsCreateRoleModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-1.5 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Role</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomRoles.map((role) => {
              const assignedMembers = members.filter((m) => m.roleId === role.id);

              return (
                <div
                  key={role.id}
                  className="flex flex-col justify-between rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-4"
                >
                  <div className="space-y-3">
                    {/* Role Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                            {role.name}
                          </h4>
                        </div>
                        <span className="inline-block mt-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-neutral-800 dark:text-neutral-200">
                          Badge: [{role.badge}]
                        </span>
                      </div>
                      <span className="rounded-full bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-500 border border-neutral-200 dark:border-neutral-800">
                        Admin Created
                      </span>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
                      {role.description}
                    </p>

                    {/* Assigned Staff Avatars */}
                    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/60 p-2.5 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {assignedMembers.length > 0 ? (
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {assignedMembers.slice(0, 4).map((m) => (
                              <div
                                key={m.id}
                                className="relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-white dark:ring-black shrink-0"
                                title={`${m.name} (${m.email})`}
                              >
                                <Image
                                  src={getValidAvatarUrl(m.avatarUrl)}
                                  alt={m.name}
                                  fill
                                  sizes="24px"
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">No staff assigned</span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                        {assignedMembers.length} Admin{assignedMembers.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* Granted Permissions List */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-400">
                        <span>Authorized Capabilities</span>
                        <span>{role.permissions.length} Modules</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {role.permissions.map((p) => {
                          const permDef = ALL_PERMISSIONS.find((item) => item.key === p);
                          return (
                            <span
                              key={p}
                              className="rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-300"
                            >
                              {permDef?.module || p}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-900">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRole(role)}
                      className="flex items-center gap-1 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Blueprint</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRole(role.id)}
                      className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* "+ Create New Custom Role" Action Card */}
            <button
              type="button"
              onClick={() => setIsCreateRoleModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-neutral-500 hover:text-black dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer min-h-[260px]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold">Create Custom Role</span>
              <span className="text-[11px] text-neutral-400 text-center max-w-[180px]">
                Define specialized permissions for departmental administrators
              </span>
            </button>
          </div>

          {/* Collapsible / Reference Section: Built-in System Roles */}
          <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  Built-in System Roles ({systemRoles.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">System Locked</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {systemRoles.map((sRole) => (
                <div
                  key={sRole.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                      {sRole.name}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">[{sRole.badge}]</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-2">
                    {sRole.description}
                  </p>
                  <div className="text-[10px] font-mono text-neutral-400 pt-1">
                    {sRole.permissions.length} modules granted
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULL PERMISSIONS MATRIX */}
      {/* ========================================================================= */}
      {activeTab === "matrix" && (
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Granular Permissions &amp; Feature Access Matrix
              </h3>
              <p className="text-xs text-neutral-500">
                Toggle exact module capabilities for system and admin-created custom roles.
              </p>
            </div>
            {isSaved && (
              <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-xs font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Matrix Updated!</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4 min-w-[220px]">Permission Feature</th>
                  <th className="py-3 px-4">Module</th>
                  {roles.map((r) => (
                    <th key={r.id} className="py-3 px-4 text-center min-w-[130px]">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">{r.name}</div>
                      <div className="text-[9px] font-mono text-neutral-400">
                        [{r.badge}] {r.isSystem ? "(Sys)" : "(Custom)"}
                      </div>
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

      {/* ========================================================================= */}
      {/* 4. SECURITY & AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Administrative Security &amp; Audit Log
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Tamper-Proof Audit Record</span>
          </div>

          <div className="space-y-3">
            {[
              { actor: "Ahmed Al-Azaiza (Super Admin)", action: "Promoted studio @nour_design to Critique & Review Lead", time: "10 minutes ago", ip: "192.168.1.101" },
              { actor: "Ahmed Al-Azaiza (Super Admin)", action: "Created custom admin role 'Brand & Taxonomy Custodian'", time: "45 minutes ago", ip: "192.168.1.101" },
              { actor: "Israa Zorob (Curator)", action: "Featured 'Kinetics Interface System' monograph on Staff Picks", time: "1 hour ago", ip: "82.114.16.22" },
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

      {/* ========================================================================= */}
      {/* MODAL: PROMOTE CREATOR OR INVITE ADMIN */}
      {/* ========================================================================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Add Administrator
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

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 border border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setInviteMode("promote")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  inviteMode === "promote"
                    ? "bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                )}
              >
                Promote Existing Creator
              </button>
              <button
                type="button"
                onClick={() => setInviteMode("email")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  inviteMode === "email"
                    ? "bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                )}
              >
                Invite External by Email
              </button>
            </div>

            {/* 1. PROMOTE CREATOR TAB */}
            {inviteMode === "promote" ? (
              <form onSubmit={handlePromoteCreatorSubmit} className="space-y-4">
                <p className="text-xs text-neutral-500">
                  Select an existing designer or studio from the community to elevate into the internal admin team.
                </p>

                {/* Creator Search & Select */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Search Community Creators
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={promoteSearch}
                      onChange={(e) => setPromoteSearch(e.target.value)}
                      placeholder="Type name, @username, or location..."
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                  </div>

                  {/* Creator Selection Radio List */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 bg-neutral-50 dark:bg-neutral-950">
                    {eligibleCreators.length === 0 ? (
                      <div className="p-4 text-center text-xs text-neutral-400">
                        No eligible creators found.
                      </div>
                    ) : (
                      eligibleCreators.map((c) => {
                        const isSelected = selectedCreatorId === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCreatorId(c.id)}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors",
                              isSelected
                                ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                                : "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={getValidAvatarUrl(c.avatarUrl)}
                                  alt={c.displayName}
                                  fill
                                  sizes="28px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold truncate">{c.displayName}</div>
                                <div className="text-[10px] opacity-70 font-mono">@{c.username}</div>
                              </div>
                            </div>

                            {isSelected && <Check className="h-4 w-4 shrink-0 stroke-[3]" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Assign Administrative Role *
                  </label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
                  >
                    <optgroup label="System Roles">
                      {systemRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} [{r.badge}]
                        </option>
                      ))}
                    </optgroup>
                    {customRoles.length > 0 && (
                      <optgroup label="Admin-Created Roles">
                        {customRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} [{r.badge}]
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-[10px] text-neutral-400">
                    {roles.find((r) => r.id === selectedRoleId)?.description}
                  </p>
                </div>

                {/* Submit Controls */}
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
                    disabled={!selectedCreatorId}
                    className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Promote Creator to Admin</span>
                  </button>
                </div>
              </form>
            ) : (
              /* 2. INVITE VIA EMAIL TAB */
              <form onSubmit={handleInviteEmailSubmit} className="space-y-4">
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
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. sarah@layerat.com"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Assigned Role *
                  </label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer"
                  >
                    <optgroup label="System Roles">
                      {systemRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} [{r.badge}]
                        </option>
                      ))}
                    </optgroup>
                    {customRoles.length > 0 && (
                      <optgroup label="Admin-Created Roles">
                        {customRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} [{r.badge}]
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
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
                    <span>Send Invitation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE CUSTOM ROLE */}
      {/* ========================================================================= */}
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
                  Role Description &amp; Scope
                </label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Outline responsibilities and operational scope..."
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              {/* Granted Permissions Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Granted Module Permissions ({newRolePerms.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (newRolePerms.length === ALL_PERMISSIONS.length) setNewRolePerms([]);
                      else setNewRolePerms(ALL_PERMISSIONS.map((p) => p.key));
                    }}
                    className="text-[10px] font-mono text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    {newRolePerms.length === ALL_PERMISSIONS.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

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

      {/* ========================================================================= */}
      {/* MODAL: EDIT CUSTOM ROLE */}
      {/* ========================================================================= */}
      {isEditRoleModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[28px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Edit Role Blueprint: {editingRole.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditRoleModalOpen(false);
                  setEditingRole(null);
                }}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
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
                    value={editingRole.badge}
                    onChange={(e) => setEditingRole({ ...editingRole, badge: e.target.value.toUpperCase() })}
                    className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Role Description &amp; Scope
                </label>
                <textarea
                  rows={2}
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full rounded-[12px] border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              {/* Permissions Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Granted Module Permissions ({editingRole.permissions.length} Selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = editingRole.permissions.includes(p.key);
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
                            if (isChecked) {
                              setEditingRole({
                                ...editingRole,
                                permissions: editingRole.permissions.filter((k) => k !== p.key),
                              });
                            } else {
                              setEditingRole({
                                ...editingRole,
                                permissions: [...editingRole.permissions, p.key],
                              });
                            }
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
                  onClick={() => {
                    setIsEditRoleModalOpen(false);
                    setEditingRole(null);
                  }}
                  className="rounded-full px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Role Blueprint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
