import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

const EMPTY = { loaded: false, hasGroup: false, groupId: null, role: null, members: [] };

/** Household of the signed-in user, current user first. Reloads on "family-changed". */
export default function useFamilyMembers() {
    const [family, setFamily] = useState(EMPTY);

    const load = useCallback(async () => {
        try {
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            const userId = stored.id ?? stored.userId;
            if (!userId) return;

            const userRes = await apiFetch(`/api/users/${userId}`);
            if (!userRes.ok) return;
            const user = await userRes.json();
            const groupId = user.familyGroup?.id ?? user.familyGroupId ?? null;

            let members = [];
            if (groupId) {
                const res = await apiFetch(`/api/users/family/${groupId}`);
                if (!res.ok) return;
                members = await res.json();
                members.sort((a, b) => (b.userId === user.userId) - (a.userId === user.userId));
            }
            setFamily({ loaded: true, hasGroup: Boolean(groupId), groupId, role: user.role, members });
        } catch {
            // The menu simply stays without sub-items if the API is unreachable.
        }
    }, []);

    useEffect(() => {
        void load();
        window.addEventListener("family-changed", load);
        return () => window.removeEventListener("family-changed", load);
    }, [load]);

    return family;
}
