import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, P } from "@/components/ui/typography";
import { useActivities } from "@/hooks/useActivities";

const actionIcons = {
	emprestado: "build" as const,
	devolvido: "assignment-return" as const,
	manutencao_enviado: "build-circle" as const,
	manutencao_retornado: "check-circle" as const,
	transferido: "swap-horiz" as const,
	descartado: "delete" as const,
};

const actionLabels = {
	emprestado: "emprestada",
	devolvido: "devolvida",
	manutencao_enviado: "enviada para manutenção",
	manutencao_retornado: "retornada da manutenção",
	transferido: "transferida",
	descartado: "descartada",
};

const actionColors = {
	emprestado: "#f59e0b",
	devolvido: "#10b981",
	manutencao_enviado: "#ef4444",
	manutencao_retornado: "#3b82f6",
	transferido: "#8b5cf6",
	descartado: "#6b7280",
};

const filterOptions = [
	{ key: "all", label: "Todas", icon: "list" as const },
	{ key: "emprestado", label: "Empréstimos", icon: "build" as const },
	{ key: "devolvido", label: "Devoluções", icon: "assignment-return" as const },
	{
		key: "manutencao_enviado",
		label: "Manutenção",
		icon: "build-circle" as const,
	},
	{ key: "transferido", label: "Transferências", icon: "swap-horiz" as const },
];

function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffInMinutes = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60),
	);

	if (diffInMinutes < 1) {
		return "agora";
	} else if (diffInMinutes < 60) {
		return `há ${diffInMinutes} min`;
	} else if (diffInMinutes < 1440) {
		const hours = Math.floor(diffInMinutes / 60);
		return `há ${hours}h`;
	} else {
		const days = Math.floor(diffInMinutes / 1440);
		return `há ${days} dia${days > 1 ? "s" : ""}`;
	}
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface ActivityItemProps {
	activity: any;
	onPress?: () => void;
}

function ActivityItem({ activity, onPress }: ActivityItemProps) {
	const actionColor =
		actionColors[activity.action as keyof typeof actionColors] || "#6b7280";
	const actionIcon =
		actionIcons[activity.action as keyof typeof actionIcons] || "build";
	const actionLabel =
		actionLabels[activity.action as keyof typeof actionLabels] ||
		activity.action;

	return (
		<TouchableOpacity
			onPress={onPress}
			className="bg-card rounded-lg p-4 border border-border mb-3"
		>
			<View className="flex-row items-start gap-3">
				<View
					className="w-12 h-12 rounded-full items-center justify-center"
					style={{ backgroundColor: `${actionColor}15` }}
				>
					<MaterialIcons name={actionIcon} size={24} color={actionColor} />
				</View>

				<View className="flex-1">
					<View className="flex-row items-start justify-between mb-1">
						<Text className="font-semibold text-foreground flex-1 mr-2">
							{activity.tool?.name || "Ferramenta"}
						</Text>
						<Text className="text-xs text-muted-foreground">
							{formatTimeAgo(activity.created_at)}
						</Text>
					</View>

					<Text className="text-sm text-muted-foreground mb-2">
						{actionLabel} por {activity.user?.full_name || "Usuário"}
					</Text>

					{activity.notes && (
						<Text className="text-xs text-muted-foreground mb-2 italic">
							"{activity.notes}"
						</Text>
					)}

					<View className="flex-row items-center gap-4">
						{activity.previous_location && activity.new_location && (
							<View className="flex-row items-center gap-1">
								<MaterialIcons name="location-on" size={14} color="#6b7280" />
								<Text className="text-xs text-muted-foreground">
									{activity.previous_location} → {activity.new_location}
								</Text>
							</View>
						)}

						<Text className="text-xs text-muted-foreground">
							{formatDate(activity.created_at)}
						</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}

interface FilterChipProps {
	option: (typeof filterOptions)[0];
	isActive: boolean;
	onPress: () => void;
	count?: number;
}

function FilterChip({ option, isActive, onPress, count }: FilterChipProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className={`flex-row items-center px-4 py-2 rounded-full border mr-2 ${
				isActive ? "bg-primary border-primary" : "bg-card border-border"
			}`}
		>
			<MaterialIcons
				name={option.icon}
				size={16}
				color={isActive ? "white" : "#6b7280"}
			/>
			<Text
				className={`ml-2 text-sm font-medium ${
					isActive ? "text-white" : "text-muted-foreground"
				}`}
			>
				{option.label}
			</Text>
			{count !== undefined && count > 0 && (
				<View
					className={`ml-2 px-2 py-0.5 rounded-full ${
						isActive ? "bg-white/20" : "bg-muted"
					}`}
				>
					<Text
						className={`text-xs font-semibold ${
							isActive ? "text-white" : "text-muted-foreground"
						}`}
					>
						{count}
					</Text>
				</View>
			)}
		</TouchableOpacity>
	);
}

export default function ActivitiesScreen() {
	const [activeFilter, setActiveFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	const { activities, loading, error, refreshing, refresh } = useActivities();

	// Filter and search activities
	const filteredActivities = useMemo(() => {
		let filtered = activities;

		// Apply action filter
		if (activeFilter !== "all") {
			filtered = filtered.filter(
				(activity) => activity.action === activeFilter,
			);
		}

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(
				(activity) =>
					activity.tool?.name?.toLowerCase().includes(query) ||
					activity.user?.full_name?.toLowerCase().includes(query) ||
					activity.notes?.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [activities, activeFilter, searchQuery]);

	// Calculate counts for filters
	const filterCounts = useMemo(() => {
		const counts = activities.reduce(
			(acc, activity) => {
				acc.all++;
				acc[activity.action] = (acc[activity.action] || 0) + 1;
				return acc;
			},
			{ all: 0 } as Record<string, number>,
		);

		return filterOptions.map((option) => ({
			...option,
			count: counts[option.key] || 0,
		}));
	}, [activities]);

	const handleActivityPress = (activity: any) => {
		if (activity.tool?.id) {
			router.push({
				pathname: "/(protected)/tool-details",
				params: { toolId: activity.tool.id },
			});
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				{/* Header */}
				<View className="flex-row items-center justify-between p-4 border-b border-border">
					<View className="flex-row items-center gap-3">
						<TouchableOpacity
							onPress={() => router.back()}
							className="w-10 h-10 items-center justify-center rounded-full bg-card border border-border"
						>
							<MaterialIcons name="arrow-back" size={20} color="#374151" />
						</TouchableOpacity>
						<H1 className="text-xl font-bold text-foreground">
							Atividades Recentes
						</H1>
					</View>
				</View>

				{/* Search Bar */}
				<View className="p-4 border-b border-border">
					<View className="flex-row items-center bg-card border border-border rounded-lg px-3 py-2">
						<MaterialIcons name="search" size={20} color="#6b7280" />
						<TextInput
							placeholder="Buscar por ferramenta, usuário ou observação..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							className="flex-1 ml-3 text-foreground"
							placeholderTextColor="#9ca3af"
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity onPress={() => setSearchQuery("")}>
								<MaterialIcons name="clear" size={20} color="#6b7280" />
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Filter Chips */}
				<View className="px-4 py-3 border-b border-border">
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingRight: 16 }}
					>
						{filterCounts.map((option) => (
							<FilterChip
								key={option.key}
								option={option}
								isActive={activeFilter === option.key}
								onPress={() => setActiveFilter(option.key)}
								count={option.count}
							/>
						))}
					</ScrollView>
				</View>

				{/* Error State */}
				{error && (
					<View className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
						<View className="flex-row items-center gap-2">
							<MaterialIcons name="error-outline" size={20} color="#ef4444" />
							<Text className="text-red-800 text-sm font-medium">Erro</Text>
						</View>
						<Text className="text-red-700 text-sm mt-1">{error}</Text>
						<Button
							variant="outline"
							size="sm"
							onPress={refresh}
							className="mt-3 border-red-200"
						>
							<Text className="text-red-600">Tentar novamente</Text>
						</Button>
					</View>
				)}

				{/* Activities List */}
				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={refresh} />
					}
				>
					<View className="p-4">
						{loading ? (
							// Loading skeleton
							Array.from({ length: 5 }).map((_, index) => (
								<View
									key={index}
									className="bg-card rounded-lg p-4 border border-border mb-3"
								>
									<View className="flex-row items-start gap-3">
										<View className="w-12 h-12 rounded-full bg-gray-200" />
										<View className="flex-1 gap-2">
											<View className="h-4 bg-gray-200 rounded w-3/4" />
											<View className="h-3 bg-gray-200 rounded w-1/2" />
											<View className="h-3 bg-gray-200 rounded w-1/3" />
										</View>
									</View>
								</View>
							))
						) : filteredActivities.length > 0 ? (
							filteredActivities.map((activity) => (
								<ActivityItem
									key={activity.id}
									activity={activity}
									onPress={() => handleActivityPress(activity)}
								/>
							))
						) : (
							// Empty state
							<View className="flex-1 items-center justify-center py-12">
								<MaterialIcons
									name={searchQuery ? "search-off" : "inbox"}
									size={64}
									color="#9ca3af"
								/>
								<Text className="text-lg font-medium text-muted-foreground mt-4 mb-2">
									{searchQuery
										? "Nenhuma atividade encontrada"
										: activeFilter === "all"
											? "Nenhuma atividade registrada"
											: "Nenhuma atividade deste tipo"}
								</Text>
								<P className="text-muted-foreground text-center max-w-sm">
									{searchQuery
										? "Tente ajustar sua busca ou verificar a ortografia"
										: activeFilter === "all"
											? "As atividades aparecerão aqui conforme você usar o sistema"
											: "Altere o filtro para ver outras atividades"}
								</P>
								{searchQuery && (
									<Button
										variant="outline"
										onPress={() => setSearchQuery("")}
										className="mt-4"
									>
										<Text>Limpar busca</Text>
									</Button>
								)}
							</View>
						)}
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}
