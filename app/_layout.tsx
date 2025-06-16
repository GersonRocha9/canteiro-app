import "../global.css";

import { Stack } from "expo-router";

import { AuthProvider } from "@/context/supabase-provider";

export default function AppLayout() {
	return (
		<AuthProvider>
			<Stack
				screenOptions={{
					headerShown: false,
					gestureEnabled: true,
					fullScreenGestureEnabled: true,
				}}
			>
				<Stack.Screen name="(protected)" />
				<Stack.Screen name="welcome" />
				<Stack.Screen
					name="sign-up"
					options={{
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name="sign-in"
					options={{
						presentation: "modal",
					}}
				/>
			</Stack>
		</AuthProvider>
	);
}
