import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { useTools } from "@/hooks/useTools";
import { ToolWithRelations } from "@/types/database.types";

const statusConfig = {
	disponivel: {
		label: "Disponível",
		color: "#10b981",
		bgColor: "bg-green-100",
		textColor: "text-green-800",
	},
	em_uso: {
		label: "Em Uso",
		color: "#f59e0b",
		bgColor: "bg-amber-100",
		textColor: "text-amber-800",
	},
	manutencao: {
		label: "Manutenção",
		color: "#ef4444",
		bgColor: "bg-red-100",
		textColor: "text-red-800",
	},
	danificada: {
		label: "Danificada",
		color: "#6b7280",
		bgColor: "bg-gray-100",
		textColor: "text-gray-800",
	},
	descartada: {
		label: "Descartada",
		color: "#374151",
		bgColor: "bg-gray-200",
		textColor: "text-gray-900",
	},
};

const filterOptions = [
	{ key: "all", label: "Todas", count: 0 },
	{ key: "disponivel", label: "Disponíveis", count: 0 },
	{ key: "em_uso", label: "Em Uso", count: 0 },
	{ key: "manutencao", label: "Manutenção", count: 0 },
	{ key: "danificada", label: "Danificadas", count: 0 },
];

interface FilterChipProps {
	label: string;
	count: number;
	active: boolean;
	onPress: () => void;
}

function FilterChip({ label, count, active, onPress }: FilterChipProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className={`px-4 py-2 rounded-full border flex-row items-center gap-2 min-w-0 ${
				active ? "bg-primary border-primary" : "bg-card border-border"
			}`}
		>
			<Text
				className={`font-medium ${
					active ? "text-primary-foreground" : "text-foreground"
				}`}
			>
				{label}
			</Text>
			<View
				className={`px-2 py-0.5 rounded-full min-w-[20px] items-center ${
					active ? "bg-primary-foreground/20" : "bg-muted"
				}`}
			>
				<Text
					className={`text-xs font-semibold ${
						active ? "text-primary-foreground" : "text-muted-foreground"
					}`}
				>
					{count}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

interface ToolCardProps {
	tool: ToolWithRelations;
	onPress: () => void;
}

function ToolCard({ tool, onPress }: ToolCardProps) {
	const config = statusConfig[tool.status];

	return (
		<TouchableOpacity
			onPress={onPress}
			className="bg-card rounded-lg p-4 border border-border shadow-sm"
		>
			<View className="flex-row items-start justify-between mb-3">
				<View className="flex-1 mr-3">
					<Text className="font-semibold text-lg text-foreground mb-1">
						{tool.name}
					</Text>
					{tool.description && (
						<Text className="text-sm text-muted-foreground mb-2">
							{tool.description}
						</Text>
					)}
				</View>
				<View className={`px-3 py-1 rounded-full ${config.bgColor}`}>
					<Text className={`text-xs font-semibold ${config.textColor}`}>
						{config.label}
					</Text>
				</View>
			</View>

			<View className="flex-row items-center gap-4 mb-3">
				<View className="flex-row items-center gap-1">
					<MaterialIcons name="location-on" size={14} color="#6b7280" />
					<Text className="text-xs text-muted-foreground">{tool.location}</Text>
				</View>
				{tool.category && (
					<View className="flex-row items-center gap-1">
						<MaterialIcons name="category" size={14} color="#6b7280" />
						<Text className="text-xs text-muted-foreground">
							{tool.category.name}
						</Text>
					</View>
				)}
			</View>

			{tool.assigned_user && (
				<View className="flex-row items-center gap-2 pt-3 border-t border-border">
					<MaterialIcons name="person" size={16} color="#6b7280" />
					<Text className="text-sm text-muted-foreground">
						Atribuída para {tool.assigned_user.full_name}
					</Text>
				</View>
			)}

			{tool.serial_number && (
				<View className="flex-row items-center gap-2 mt-2">
					<MaterialIcons name="tag" size={14} color="#6b7280" />
					<Text className="text-xs text-muted-foreground">
						S/N: {tool.serial_number}
					</Text>
				</View>
			)}
		</TouchableOpacity>
	);
}

export default function ToolsScreen() {
	const params = useLocalSearchParams();
	const initialFilter =
		params.filter === "available"
			? "disponivel"
			: params.filter === "in-use"
				? "em_uso"
				: params.filter === "maintenance"
					? "manutencao"
					: "all";

	const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
	const [searchQuery, setSearchQuery] = useState("");

	const { tools, loading, error, refreshing, refresh } = useTools({
		status: activeFilter === "all" ? undefined : (activeFilter as any),
		searchQuery,
	});

	// Calculate counts for filters
	const filterCounts = useMemo(() => {
		const counts = tools.reduce(
			(acc, tool) => {
				acc.all++;
				acc[tool.status] = (acc[tool.status] || 0) + 1;
				return acc;
			},
			{
				all: 0,
				disponivel: 0,
				em_uso: 0,
				manutencao: 0,
				danificada: 0,
				descartada: 0,
			} as Record<string, number>,
		);

		return filterOptions.map((filter) => ({
			...filter,
			count: counts[filter.key] || 0,
		}));
	}, [tools]);

	const handleToolPress = (tool: ToolWithRelations) => {
		router.push({
			pathname: "/(protected)/tool-details",
			params: { toolId: tool.id },
		});
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1">
				{/* Header */}
				<View className="px-4 pt-4 pb-2 border-b border-border bg-background">
					<H1 className="text-2xl font-bold text-foreground mb-2">
						Ferramentas
					</H1>

					{/* Search */}
					<View className="flex-row items-center bg-card border border-border rounded-lg px-3 py-2 mb-4">
						<MaterialIcons name="search" size={20} color="#6b7280" />
						<TextInput
							placeholder="Buscar ferramentas..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							className="flex-1 ml-2 text-foreground"
							placeholderTextColor="#9ca3af"
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity onPress={() => setSearchQuery("")}>
								<MaterialIcons name="close" size={20} color="#6b7280" />
							</TouchableOpacity>
						)}
					</View>

					{/* Filter chips */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className="flex-row gap-2"
						contentContainerClassName="px-0"
					>
						{filterCounts.map((filter) => (
							<FilterChip
								key={filter.key}
								label={filter.label}
								count={filter.count}
								active={activeFilter === filter.key}
								onPress={() => setActiveFilter(filter.key)}
							/>
						))}
					</ScrollView>
				</View>

				{/* Error State */}
				{error && (
					<View className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
						<Text className="text-red-800 text-sm">{error}</Text>
					</View>
				)}

				{/* Tools List */}
				<ScrollView
					className="flex-1"
					contentContainerClassName="p-4 gap-3"
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={refresh} />
					}
				>
					{loading ? (
						// Loading skeleton
						Array.from({ length: 5 }).map((_, index) => (
							<View
								key={index}
								className="bg-card rounded-lg p-4 border border-border"
							>
								<View className="flex-row justify-between mb-3">
									<View className="flex-1">
										<View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
										<View className="h-4 bg-gray-200 rounded w-full" />
									</View>
									<View className="h-6 bg-gray-200 rounded w-20" />
								</View>
								<View className="flex-row gap-4 mb-3">
									<View className="h-3 bg-gray-200 rounded w-24" />
									<View className="h-3 bg-gray-200 rounded w-20" />
								</View>
								<View className="h-3 bg-gray-200 rounded w-32" />
							</View>
						))
					) : tools.length > 0 ? (
						tools.map((tool) => (
							<ToolCard
								key={tool.id}
								tool={tool}
								onPress={() => handleToolPress(tool)}
							/>
						))
					) : (
						<View className="flex-1 items-center justify-center py-12">
							<MaterialIcons
								name={
									searchQuery
										? "search-off"
										: activeFilter === "all"
											? "build"
											: "filter-list-off"
								}
								size={64}
								color="#9ca3af"
							/>
							<Text className="text-lg font-medium text-muted-foreground mt-4 mb-2">
								{searchQuery
									? "Nenhuma ferramenta encontrada"
									: activeFilter === "all"
										? "Nenhuma ferramenta cadastrada"
										: "Nenhuma ferramenta neste status"}
							</Text>
							<P className="text-muted-foreground text-center max-w-sm">
								{searchQuery
									? "Tente ajustar sua busca ou verificar a ortografia"
									: activeFilter === "all"
										? "Cadastre sua primeira ferramenta para começar"
										: "Altere o filtro para ver outras ferramentas"}
							</P>
							{!searchQuery && activeFilter === "all" && (
								<Button
									className="mt-6"
									onPress={() => router.push("/(protected)/(tabs)/add-tool")}
								>
									<Text className="text-primary-foreground font-semibold">
										Cadastrar Ferramenta
									</Text>
								</Button>
							)}
						</View>
					)}
				</ScrollView>

				{/* Add Tool FAB */}
				<TouchableOpacity
					onPress={() => router.push("/(protected)/(tabs)/add-tool")}
					className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
					style={{ elevation: 5 }}
				>
					<MaterialIcons name="add" size={24} color="white" />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
