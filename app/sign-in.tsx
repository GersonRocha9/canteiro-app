import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, P } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

const formSchema = z.object({
	email: z.string().email("Por favor, insira um email válido."),
	password: z
		.string()
		.min(8, "A senha deve ter pelo menos 8 caracteres.")
		.max(64, "A senha deve ter menos de 64 caracteres."),
});

export default function SignIn() {
	const { signIn } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signIn(data.email, data.password);

			form.reset();
		} catch (error: Error | any) {
			console.error(error.message);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 justify-center gap-6 web:m-4">
				<View className="text-center gap-2">
					<H1 className="text-center text-3xl font-bold text-foreground">
						Canteiro
					</H1>
					<P className="text-center text-muted-foreground">
						Gerencie as ferramentas da sua obra
					</P>
				</View>

				<View className="gap-4">
					<H1 className="text-xl font-semibold">Entrar na sua conta</H1>
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormInput
										label="Email"
										placeholder="seu@email.com"
										autoCapitalize="none"
										autoComplete="email"
										autoCorrect={false}
										keyboardType="email-address"
										{...field}
									/>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormInput
										label="Senha"
										placeholder="Sua senha"
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry={true}
										{...field}
									/>
								)}
							/>
						</View>
					</Form>
				</View>
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={form.handleSubmit(onSubmit)}
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? (
						<ActivityIndicator size="small" color="white" />
					) : (
						<Text className="text-white font-semibold">Entrar</Text>
					)}
				</Button>
			</View>
		</SafeAreaView>
	);
}
