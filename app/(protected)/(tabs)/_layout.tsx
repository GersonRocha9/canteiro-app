import { colors } from "@/constants/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
					borderTopColor:
						colorScheme === "dark" ? colors.dark.border : colors.light.border,
					paddingTop: 16,
					paddingBottom: 16,
					height: 100,
					borderTopWidth: 1,
				},
				tabBarActiveTintColor:
					colorScheme === "dark" ? colors.dark.primary : colors.light.primary,
				tabBarInactiveTintColor:
					colorScheme === "dark"
						? colors.dark.mutedForeground
						: colors.light.mutedForeground,
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
					marginTop: 4,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="dashboard" color={color} size={size} />
					),
				}}
			/>

			<Tabs.Screen
				name="tools"
				options={{
					title: "Ferramentas",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="build" color={color} size={size} />
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					title: "Perfil",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="person" color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
