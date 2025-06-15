import { supabase } from "@/config/supabase";
import { ToolMovementWithRelations } from "@/types/database.types";
import { useCallback, useEffect, useState } from "react";

export function useActivities() {
	const [activities, setActivities] = useState<ToolMovementWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const fetchActivities = useCallback(async () => {
		try {
			setError(null);

			const { data, error: activitiesError } = await supabase
				.from("tool_movements")
				.select(
					`
					*,
					tool:tools(*),
					user:profiles!tool_movements_user_id_fkey(*),
					previous_assigned_user:profiles!tool_movements_previous_assigned_to_fkey(*),
					new_assigned_user:profiles!tool_movements_new_assigned_to_fkey(*)
				`,
				)
				.order("created_at", { ascending: false })
				.limit(100); // Limit to last 100 activities

			if (activitiesError) throw activitiesError;

			// Filter out activities without tool or user data
			const validActivities =
				(data as ToolMovementWithRelations[])?.filter(
					(activity) => activity.tool && activity.user,
				) || [];

			setActivities(validActivities);
		} catch (err) {
			console.error("Error fetching activities:", err);
			setError(
				err instanceof Error ? err.message : "Erro ao carregar atividades",
			);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		await fetchActivities();
	}, [fetchActivities]);

	useEffect(() => {
		fetchActivities();
	}, [fetchActivities]);

	return {
		activities,
		loading,
		error,
		refreshing,
		refresh,
	};
}
