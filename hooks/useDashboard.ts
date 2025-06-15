import { supabase } from "@/config/supabase";
import {
	DashboardStats,
	ToolMovementWithRelations,
} from "@/types/database.types";
import { useCallback, useEffect, useState } from "react";

export function useDashboard() {
	const [stats, setStats] = useState<DashboardStats>({
		total_tools: 0,
		available_tools: 0,
		in_use_tools: 0,
		maintenance_tools: 0,
		damaged_tools: 0,
		recent_activities: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const fetchDashboardData = useCallback(async () => {
		try {
			setError(null);

			// Fetch tools statistics
			const { data: toolsData, error: toolsError } = await supabase
				.from("tools")
				.select("status");

			if (toolsError) throw toolsError;

			// Calculate statistics
			const total_tools = toolsData?.length || 0;
			const available_tools =
				toolsData?.filter((t) => t.status === "disponivel").length || 0;
			const in_use_tools =
				toolsData?.filter((t) => t.status === "em_uso").length || 0;
			const maintenance_tools =
				toolsData?.filter((t) => t.status === "manutencao").length || 0;
			const damaged_tools =
				toolsData?.filter((t) => t.status === "danificada").length || 0;

			// Fetch recent activities
			const { data: activitiesData, error: activitiesError } = await supabase
				.from("tool_movements")
				.select(
					`
					*,
					tool:tools(*),
					user:profiles!tool_movements_user_id_fkey(*)
				`,
				)
				.order("created_at", { ascending: false })
				.limit(10);

			if (activitiesError) throw activitiesError;

			const recent_activities =
				(activitiesData as ToolMovementWithRelations[]) || [];

			setStats({
				total_tools,
				available_tools,
				in_use_tools,
				maintenance_tools,
				damaged_tools,
				recent_activities: recent_activities.filter(
					(activity) => activity.tool && activity.user,
				) as (ToolMovementWithRelations & {
					tool: any;
					user: any;
				})[],
			});
		} catch (err) {
			console.error("Error fetching dashboard data:", err);
			setError(
				err instanceof Error
					? err.message
					: "Erro ao carregar dados do dashboard",
			);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		await fetchDashboardData();
	}, [fetchDashboardData]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	return {
		stats,
		loading,
		error,
		refreshing,
		refresh,
	};
}
