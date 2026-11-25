import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../../../api/apiFetch";
import { roleLabel } from "../../../constants/labels";

const money = (n) => {
    try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n ?? 0)); }
    catch { return `${Number(n ?? 0).toFixed(2)} €`; }
};

export default function FamilyTab({ view, memberId }) {
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

    const [transferAmount, setTransferAmount] = useState("");
    const [transferNote, setTransferNote] = useState("");
    const [transferring, setTransferring] = useState(false);
    const [transferMsg, setTransferMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        loadFamily();
    }, [userId]);

    // Each member has their own page: don't carry a half-filled transfer to another one.
    useEffect(() => {
        setTransferAmount("");
        setTransferNote("");
        setTransferMsg({ type: "", text: "" });
    }, [memberId]);

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
                body: JSON.stringify({ userId, name: groupName.trim() || "Ma famille" }),
            });
            const data = await res.json();
            if (res.ok) {
                setCreateGroupMsg({ type: "success", text: data.message });
                await loadFamily();
                const stored = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...stored, familyGroupId: data.id }));
                window.dispatchEvent(new Event("family-changed"));
            } else {
                setCreateGroupMsg({ type: "error", text: data.message || "Impossible de créer le foyer." });
            }
        } catch { setCreateGroupMsg({ type: "error", text: "Erreur réseau." }); }
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
            else alert("Impossible de générer le code : " + (data.message || "erreur inconnue"));
        } catch { alert("Erreur réseau."); }
        finally { setGenerating(false); }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { setJoinMsg({ type: "error", text: "Saisissez le code à 8 caractères." }); return; }
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
                window.dispatchEvent(new Event("family-changed"));
            } else {
                setJoinMsg({ type: "error", text: data.message || "Code invalide." });
            }
        } catch { setJoinMsg({ type: "error", text: "Erreur réseau." }); }
        finally { setJoining(false); }
    };

    const handleTransfer = async () => {
        if (!transferAmount || Number(transferAmount) <= 0) { setTransferMsg({ type: "error", text: "Entrez un montant valide." }); return; }
        setTransferring(true);
        setTransferMsg({ type: "", text: "" });
        try {
            const res = await apiFetch("/api/family/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromUserId: userId,
                    toUserId: Number(memberId),
                    amount: Number(transferAmount),
                    note: transferNote.trim() || null,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTransferMsg({ type: "success", text: data.message });
                setTransferAmount(""); setTransferNote("");
            } else {
                setTransferMsg({ type: "error", text: data.message || "Échec du transfert." });
            }
        } catch { setTransferMsg({ type: "error", text: "Erreur réseau." }); }
        finally { setTransferring(false); }
    };

    const initials = (u) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
    const roleColor = (r) => ({ PARENT: "bg-wine", ADULT: "bg-blue-600", CHILD: "bg-green-600" }[r] ?? "bg-slate-400");

    if (loading) return <div className="rounded-xl border bg-white p-6 text-slate-500">Chargement du foyer...</div>;

    const familyGroupId = userData?.familyGroup?.id ?? userData?.familyGroupId ?? null;
    const isParent = (userData?.role ?? userRole) === "PARENT";
    const member = view === "member" ? members.find(m => String(m.userId ?? m.id) === memberId) : null;
    const isSelf = String(memberId) === String(userId);
    const memberGoals = familyGoals.filter(g => String(g.createdByUserId) === memberId);

    if (view === "index") {
        return <Navigate to={familyGroupId ? `/family/members/${userId}` : "/family/add"} replace />;
    }
    if (view === "member" && (!familyGroupId || (members.length > 0 && !member))) {
        return <Navigate to="/family" replace />;
    }
    if (view === "add" && familyGroupId && !isParent) {
        return <Navigate to="/family" replace />;
    }

    return (
        <div className="space-y-6">

            {member && (
                <div className="rounded-xl border bg-white p-6 flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-full ${roleColor(member.role)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                        {initials(member)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-slate-900">{member.firstName} {member.lastName} {isSelf && <span className="text-xs font-normal text-slate-400">(vous)</span>}</div>
                        <div className="text-sm text-slate-500 break-all">{member.email}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${roleColor(member.role)}`}>{roleLabel(member.role)}</span>
                </div>
            )}

            {view === "add" && !familyGroupId && isParent && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Créez votre foyer</h3>
                        <p className="text-sm text-slate-500 mt-1">En tant que {roleLabel(userRole).toLowerCase()}, vous pouvez créer un foyer et inviter des membres.</p>
                    </div>
                    {createGroupMsg.text && (
                        <div className={`rounded-lg border p-3 text-sm ${createGroupMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {createGroupMsg.text}
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Nom du foyer (facultatif)</label>
                        <input
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="ex. La famille Martin"
                        />
                    </div>
                    <button onClick={handleCreateGroup} disabled={creatingGroup}
                        className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {creatingGroup ? "Création..." : "Créer le foyer"}
                    </button>
                </div>
            )}

            {view === "add" && !familyGroupId && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Rejoindre un foyer</h3>
                        <p className="text-sm text-slate-500 mt-1">Demandez à un adulte de votre foyer de générer un code, puis saisissez-le ci-dessous.</p>
                    </div>
                    {joinMsg.text && (
                        <div className={`rounded-lg border p-3 text-sm ${joinMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {joinMsg.text}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Code d'invitation à 8 caractères</label>
                            <input className="w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#72383D]" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ex. AB3C7XYZ" maxLength={8} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Votre rôle</label>
                            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]" value={joinRole} onChange={e => setJoinRole(e.target.value)}>
                                <option value="PARENT">Parent</option>
                                <option value="CHILD">Enfant</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleJoin} disabled={joining} className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {joining ? "Connexion au foyer..." : "Rejoindre le foyer"}
                    </button>
                </div>
            )}

            {view === "add" && isParent && familyGroupId && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Inviter un membre du foyer</h3>
                        <p className="text-sm text-slate-500 mt-1">Générez un code à usage unique de 8 caractères et partagez-le.</p>
                    </div>
                    <button onClick={handleGenerateCode} disabled={generating} className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {generating ? "Génération..." : "Générer un code d'invitation"}
                    </button>
                    {generatedCode && (
                        <div className="rounded-xl border-2 border-dashed border-wine bg-red-50 p-5 text-center space-y-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Partagez ce code avec un membre de votre foyer</div>
                            <div className="text-4xl font-bold font-mono tracking-[0.4em] text-wine">{generatedCode}</div>
                            <div className="text-xs text-slate-500">Valable une seule fois.</div>
                            <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="rounded-lg border border-wine text-wine px-4 py-1.5 text-sm hover:bg-winePale transition">
                                Copier le code
                            </button>
                        </div>
                    )}
                </div>
            )}

            {member && isParent && !isSelf && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Envoyer de l'argent de poche à {member.firstName}</h3>
                        <p className="text-sm text-slate-500 mt-1">Transférez de l'argent à un membre du foyer — cela apparaîtra comme un revenu sur son compte.</p>
                    </div>
                    {transferMsg.text && (
                        <div className={`rounded-lg border p-3 text-sm ${transferMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {transferMsg.text}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Montant (€)</label>
                            <input type="number" min="0" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                                value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Note (facultatif)</label>
                            <input type="text" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                                value={transferNote} onChange={e => setTransferNote(e.target.value)} placeholder="ex. Argent de poche hebdomadaire" />
                        </div>
                    </div>
                    <button onClick={handleTransfer} disabled={transferring} className="rounded-lg bg-wine text-white px-5 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition">
                        {transferring ? "Envoi..." : "Envoyer"}
                    </button>
                </div>
            )}

            {member && isParent && memberGoals.length > 0 && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">Objectifs du foyer créés par {member.firstName}</h3>
                    <div className="space-y-3">
                        {memberGoals.map(g => {
                            const pct = g.targetAmount > 0
                                ? Math.min(100, (Number(g.currentAmount ?? 0) / g.targetAmount) * 100)
                                : 0;
                            return (
                                <div key={g.id} className="rounded-lg border p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-slate-800">{g.title}</div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>{money(g.currentAmount ?? 0)} épargnés</span>
                                        <span>Objectif : {money(g.targetAmount)}</span>
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
