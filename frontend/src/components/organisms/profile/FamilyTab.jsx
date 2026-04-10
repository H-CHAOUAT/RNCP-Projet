import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../api/apiFetch";

const money = (n) => {
    try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n ?? 0)); }
    catch { return `${Number(n ?? 0).toFixed(2)} €`; }
};

export default function FamilyTab() {
    const { userId, userRole } = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return { userId: u.id ?? u.userId ?? null, userRole: u.role };
        } catch { return { userId: null, userRole: null }; }
    }, []);

    const [userData, setUserData] = useState(null);
    const [members, setMembers] = useState([]);
    const [familyGoals, setFamilyGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joinRole, setJoinRole] = useState("CHILD");
    const [joining, setJoining] = useState(false);
    const [joinMsg, setJoinMsg] = useState({ type: "", text: "" });

    const [groupName, setGroupName] = useState("");
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [createGroupMsg, setCreateGroupMsg] = useState({ type: "", text: "" });

    const [transferTo, setTransferTo] = useState("");
    const [transferAmount, setTransferAmount] = useState("");
    const [transferNote, setTransferNote] = useState("");
    const [transferring, setTransferring] = useState(false);
    const [transferMsg, setTransferMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        loadFamily();
    }, [userId]);

    const loadFamily = async () => {
        setLoading(true);
        try {
            const userRes = await apiFetch(`/api/users/${userId}`);
            if (!userRes.ok) throw new Error();
            const user = await userRes.json();
            setUserData(user);
            const fgId = user.familyGroup?.id ?? user.familyGroupId ?? null;
            if (fgId) {
                const [famRes, goalsRes] = await Promise.all([
                    apiFetch(`/api/users/family/${fgId}`),
                    apiFetch(`/api/goals/family/${fgId}`),
                ]);
                if (famRes.ok) setMembers(await famRes.json());
                if (goalsRes.ok) setFamilyGoals(await goalsRes.json());
            }
        } catch {}
        finally { setLoading(false); }
    };

    const handleCreateGroup = async () => {
        setCreatingGroup(true);
        setCreateGroupMsg({ type: "", text: "" });
        try {
            const res = await apiFetch("/api/family/create-group", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, name: groupName.trim() || "My Family" }),
            });
            const data = await res.json();
            if (res.ok) {
                setCreateGroupMsg({ type: "success", text: data.message });
                await loadFamily();
                const stored = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...stored, familyGroupId: data.id }));
            } else {
                setCreateGroupMsg({ type: "error", text: data.message || "Could not create group." });
            }
        } catch { setCreateGroupMsg({ type: "error", text: "Network error." }); }
        finally { setCreatingGroup(false); }
    };

    const handleGenerateCode = async () => {
        setGenerating(true);
        setGeneratedCode(null);
        try {
            const res = await apiFetch("/api/family/invite-code/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (res.ok) setGeneratedCode(data.code);
            else alert("Could not generate code: " + (data.message || "unknown error"));
        } catch { alert("Network error."); }
        finally { setGenerating(false); }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { setJoinMsg({ type: "error", text: "Enter the 8-character code." }); return; }
        setJoining(true);
        setJoinMsg({ type: "", text: "" });
        try {
            const res = await apiFetch("/api/family/invite-code/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, code: joinCode.trim(), role: joinRole }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setJoinMsg({ type: "success", text: data.message });
                setJoinCode("");
                await loadFamily();
                const refreshed = await apiFetch(`/api/users/${userId}`);
                if (refreshed.ok) {
                    const freshUser = await refreshed.json();
                    const stored = JSON.parse(localStorage.getItem("user") || "{}");
                    localStorage.setItem("user", JSON.stringify({ ...stored, role: freshUser.role }));
                }
            } else {
                setJoinMsg({ type: "error", text: data.message || "Invalid code." });
            }
        } catch { setJoinMsg({ type: "error", text: "Network error." }); }
        finally { setJoining(false); }
    };

    const handleTransfer = async () => {
        if (!transferTo) { setTransferMsg({ type: "error", text: "Select a family member." }); return; }
        if (!transferAmount || Number(transferAmount) <= 0) { setTransferMsg({ type: "error", text: "Enter a valid amount." }); return; }
        setTransferring(true);
        setTransferMsg({ type: "", text: "" });
        try {
            const res = await apiFetch("/api/family/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromUserId: userId,
                    toUserId: Number(transferTo),
                    amount: Number(transferAmount),
                    note: transferNote.trim() || null,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTransferMsg({ type: "success", text: data.message });
                setTransferTo(""); setTransferAmount(""); setTransferNote("");
            } else {
                setTransferMsg({ type: "error", text: data.message || "Transfer failed." });
            }
        } catch { setTransferMsg({ type: "error", text: "Network error." }); }
        finally { setTransferring(false); }
    };

    const initials = (u) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
    const roleColor = (r) => ({ PARENT: "bg-wine", PARTNER: "bg-blue-600", CHILD: "bg-green-600" }[r] ?? "bg-slate-400");

    if (loading) return <div className="rounded-xl border bg-white p-6 text-slate-500">Loading family...</div>;

    const familyGroupId = userData?.familyGroup?.id ?? userData?.familyGroupId ?? null;
    const isParentOrPartner = userRole === "PARENT" || userRole === "PARTNER";
    const otherMembers = members.filter(m => (m.userId ?? m.id) !== userId);

    return (
        <div className="space-y-6">

            {familyGroupId && members.length > 0 && (
                <div className="rounded-xl border bg-white p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Family members ({members.length})</h3>
                    <div className="space-y-3">
                        {members.map((m) => (
                            <div key={m.userId ?? m.id} className="flex items-center gap-3 rounded-lg border p-3">
                                <div className={`h-10 w-10 rounded-full ${roleColor(m.role)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                                    {initials(m)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-800">{m.firstName} {m.lastName} {(m.userId ?? m.id) === userId && <span className="text-xs text-slate-400">(you)</span>}</div>
                                    <div className="text-xs text-slate-400">{m.email}</div>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${roleColor(m.role)}`}>{m.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!familyGroupId && isParentOrPartner && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Create your family group</h3>
                        <p className="text-sm text-slate-500 mt-1">As a {userRole.toLowerCase()}, you can create a family group and invite members.</p>
                    </div>
                    {createGroupMsg.text && (
                        <div className={`rounded-lg border p-3 text-sm ${createGroupMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {createGroupMsg.text}
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Group name (optional)</label>
                        <input
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="e.g. The Smith Family"
                        />
                    </div>
                    <button onClick={handleCreateGroup} disabled={creatingGroup}
                        className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {creatingGroup ? "Creating..." : "Create family group"}
                    </button>
                </div>
            )}

            {!familyGroupId && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Join a family group</h3>
                        <p className="text-sm text-slate-500 mt-1">Ask your family admin to generate a code, then enter it below.</p>
                    </div>
                    {joinMsg.text && (
                        <div className={`rounded-lg border p-3 text-sm ${joinMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {joinMsg.text}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-600 mb-1 block">8-character invite code</label>
                            <input className="w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#72383D]" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. AB3C7XYZ" maxLength={8} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Your role</label>
                            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]" value={joinRole} onChange={e => setJoinRole(e.target.value)}>
                                <option value="PARTNER">Partner</option>
                                <option value="CHILD">Child</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleJoin} disabled={joining} className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {joining ? "Joining..." : "Join family"}
                    </button>
                </div>
            )}

            {isParentOrPartner && familyGroupId && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Invite a family member</h3>
                        <p className="text-sm text-slate-500 mt-1">Generate a one-time 8-character code and share it.</p>
                    </div>
                    <button onClick={handleGenerateCode} disabled={generating} className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {generating ? "Generating..." : "Generate invite code"}
                    </button>
                    {generatedCode && (
                        <div className="rounded-xl border-2 border-dashed border-wine bg-red-50 p-5 text-center space-y-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Share this code with your family member</div>
                            <div className="text-4xl font-bold font-mono tracking-[0.4em] text-wine">{generatedCode}</div>
                            <div className="text-xs text-slate-500">Valid for one use only.</div>
                            <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="rounded-lg border border-wine text-wine px-4 py-1.5 text-sm hover:bg-winePale transition">
                                Copy code
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isParentOrPartner && familyGroupId && otherMembers.length > 0 && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Send allowance</h3>
                        <p className="text-sm text-slate-500 mt-1">Transfer money to a family member — it will appear as income in their account.</p>
                    </div>
                    {transferMsg.text && (
                        <div className={`rounded-lg border p-3 text-sm ${transferMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {transferMsg.text}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Member</label>
                            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]" value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                                <option value="">Select member...</option>
                                {otherMembers.map(m => (
                                    <option key={m.userId ?? m.id} value={m.userId ?? m.id}>
                                        {m.firstName} {m.lastName} ({m.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Amount (€)</label>
                            <input type="number" min="0" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                                value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Note (optional)</label>
                            <input type="text" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                                value={transferNote} onChange={e => setTransferNote(e.target.value)} placeholder="e.g. Weekly allowance" />
                        </div>
                    </div>
                    <button onClick={handleTransfer} disabled={transferring} className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {transferring ? "Sending..." : "Send allowance"}
                    </button>
                </div>
            )}

            {isParentOrPartner && familyGroupId && familyGoals.length > 0 && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">Family goals</h3>
                    <div className="space-y-3">
                        {familyGoals.map(g => {
                            const pct = g.targetAmount > 0
                                ? Math.min(100, (Number(g.currentAmount ?? 0) / g.targetAmount) * 100)
                                : 0;
                            return (
                                <div key={g.id} className="rounded-lg border p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-slate-800">{g.title}</div>
                                        <div className="text-xs text-slate-400">{g.createdByName}</div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>{money(g.currentAmount ?? 0)} saved</span>
                                        <span>Target: {money(g.targetAmount)}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100">
                                        <div className="h-2 rounded-full bg-wine transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="text-right text-xs text-slate-400">{pct.toFixed(0)}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
