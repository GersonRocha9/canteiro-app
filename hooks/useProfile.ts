import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { ProfileWithRelations, UpdateTables } from "@/types/database.types";
import { useCallback, useEffect, useState } from "react";

export function useProfile() {
	const { session } = useAuth();
	const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProfile = useCallback(async () => {
		if (!session?.user?.id) {
			setProfile(null);
			setLoading(false);
			return;
		}

		try {
			setError(null);

			const { data, error } = await supabase
				.from("profiles")
				.select(
					`
					*,
					company:companies(*)
				`,
				)
				.eq("id", session.user.id)
				.single();

			if (error) throw error;

			setProfile(data as ProfileWithRelations);
		} catch (err) {
			console.error("Error fetching profile:", err);
			setError(err instanceof Error ? err.message : "Erro ao carregar perfil");
		} finally {
			setLoading(false);
		}
	}, [session?.user?.id]);

	const updateProfile = useCallback(
		async (updates: UpdateTables<"profiles">) => {
			if (!session?.user?.id) {
				return { error: "Usuário não autenticado" };
			}

			try {
				setError(null);

				const { data, error } = await supabase
					.from("profiles")
					.update(updates)
					.eq("id", session.user.id)
					.select(
						`
					*,
					company:companies(*)
				`,
					)
					.single();

				if (error) throw error;

				setProfile(data as ProfileWithRelations);
				return { data: data as ProfileWithRelations, error: null };
			} catch (err) {
				console.error("Error updating profile:", err);
				const errorMessage =
					err instanceof Error ? err.message : "Erro ao atualizar perfil";
				setError(errorMessage);
				return { data: null, error: errorMessage };
			}
		},
		[session?.user?.id],
	);

	const getUserStats = useCallback(async () => {
		if (!session?.user?.id) {
			return { toolsInUse: 0, totalReturns: 0 };
		}

		try {
			// Tools currently assigned to user
			const { data: toolsData, error: toolsError } = await supabase
				.from("tools")
				.select("id")
				.eq("assigned_to", session.user.id)
				.eq("status", "em_uso");

			if (toolsError) throw toolsError;

			// Total returns made by user
			const { data: returnsData, error: returnsError } = await supabase
				.from("tool_movements")
				.select("id")
				.eq("user_id", session.user.id)
				.eq("action", "devolvido");

			if (returnsError) throw returnsError;

			return {
				toolsInUse: toolsData?.length || 0,
				totalReturns: returnsData?.length || 0,
			};
		} catch (err) {
			console.error("Error fetching user stats:", err);
			return { toolsInUse: 0, totalReturns: 0 };
		}
	}, [session?.user?.id]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	return {
		profile,
		loading,
		error,
		updateProfile,
		getUserStats,
		refresh: fetchProfile,
	};
}
