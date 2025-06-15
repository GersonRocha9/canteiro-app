import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, P } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

// Função para validar CPF
function validateCPF(cpf: string): boolean {
	cpf = cpf.replace(/[^\d]+/g, "");
	if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

	const digits = cpf.split("").map((el) => +el);
	const rest = (count: number): number => {
		return (
			((digits
				.slice(0, count - 12)
				.reduce((soma, el, index) => soma + el * (count - index), 0) *
				10) %
				11) %
			10
		);
	};

	return rest(10) === digits[9] && rest(11) === digits[10];
}

const formSchema = z
	.object({
		fullName: z
			.string()
			.min(2, "O nome deve ter pelo menos 2 caracteres.")
			.max(100, "O nome deve ter menos de 100 caracteres."),
		email: z.string().email("Por favor, insira um email válido."),
		cpf: z
			.string()
			.min(11, "CPF deve ter 11 dígitos.")
			.max(14, "CPF inválido.")
			.refine((val) => validateCPF(val), "CPF inválido."),
		role: z
			.string()
			.min(2, "Por favor, selecione seu cargo.")
			.max(50, "Cargo deve ter menos de 50 caracteres."),
		companyCode: z
			.string()
			.min(4, "Código da empresa deve ter pelo menos 4 caracteres.")
			.max(20, "Código da empresa deve ter menos de 20 caracteres."),
		password: z
			.string()
			.min(8, "A senha deve ter pelo menos 8 caracteres.")
			.max(64, "A senha deve ter menos de 64 caracteres.")
			.regex(/^(?=.*[a-z])/, "A senha deve ter pelo menos uma letra minúscula.")
			.regex(/^(?=.*[A-Z])/, "A senha deve ter pelo menos uma letra maiúscula.")
			.regex(/^(?=.*[0-9])/, "A senha deve ter pelo menos um número.")
			.regex(
				/^(?=.*[!@#$%^&*])/,
				"A senha deve ter pelo menos um caractere especial.",
			),
		confirmPassword: z.string().min(8, "Confirme sua senha."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const { signUp } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: "",
			email: "",
			cpf: "",
			role: "",
			companyCode: "",
			password: "",
			confirmPassword: "",
		},
	});

	function formatCPF(value: string) {
		const cpf = value.replace(/[^\d]/g, "");
		return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signUp({
				email: data.email,
				password: data.password,
				fullName: data.fullName,
				cpf: data.cpf,
				role: data.role,
				companyCode: data.companyCode,
			});

			form.reset();
		} catch (error: Error | any) {
			console.error(error.message);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
			<ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
				<View className="gap-6 web:m-4">
					<View className="text-center gap-2">
						<H1 className="text-center text-3xl font-bold text-foreground">
							Canteiro
						</H1>
						<P className="text-center text-muted-foreground">
							Gerencie as ferramentas da sua obra
						</P>
					</View>

					<View className="gap-4">
						<H1 className="text-xl font-semibold">Criar sua conta</H1>
						<Form {...form}>
							<View className="gap-4">
								<FormField
									control={form.control}
									name="fullName"
									render={({ field }) => (
										<FormInput
											label="Nome completo"
											placeholder="Seu nome completo"
											autoCapitalize="words"
											autoComplete="name"
											autoCorrect={false}
											{...field}
										/>
									)}
								/>

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
									name="cpf"
									render={({ field }) => (
										<FormInput
											label="CPF"
											placeholder="000.000.000-00"
											autoCapitalize="none"
											autoCorrect={false}
											keyboardType="numeric"
											maxLength={14}
											{...field}
											onChangeText={(text) => {
												const formatted = formatCPF(text);
												field.onChange(formatted);
											}}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormInput
											label="Cargo/Função"
											placeholder="Ex: Encarregado, Mestre de obras, Operário"
											autoCapitalize="words"
											autoCorrect={false}
											{...field}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="companyCode"
									render={({ field }) => (
										<FormInput
											label="Código da empresa"
											placeholder="Código fornecido pela empresa"
											autoCapitalize="characters"
											autoCorrect={false}
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
											placeholder="Crie uma senha segura"
											autoCapitalize="none"
											autoCorrect={false}
											secureTextEntry
											textContentType="none"
											{...field}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormInput
											label="Confirmar senha"
											placeholder="Digite a senha novamente"
											autoCapitalize="none"
											autoCorrect={false}
											secureTextEntry
											textContentType="none"
											{...field}
										/>
									)}
								/>
							</View>
						</Form>
					</View>

					<View className="gap-4">
						<Button
							size="default"
							variant="default"
							onPress={form.handleSubmit(onSubmit)}
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Text className="text-white font-semibold">Criar conta</Text>
							)}
						</Button>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
