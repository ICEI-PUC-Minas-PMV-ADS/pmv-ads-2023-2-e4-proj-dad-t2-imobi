import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { authService } from "../../../app/services/authService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { LoginParams } from "../../../app/services/authService/login";
import { useAuth } from "../../../app/hooks/useAuth";

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(8, "A senha deve conter pelo menos 8 dígitos."),
})

type FormData = z.infer<typeof schema>;

export function useLoginController() {
  const {
    handleSubmit: hookFormHandleSubmit,
    register,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: LoginParams) => {
      return authService.login(data);
    },
  });

  const { login } = useAuth();

  const handleSubmit = hookFormHandleSubmit(async (data) => {
    try {
      const { token } = await mutateAsync(data);

      login(token);
    } catch {
      toast.error('Credenciais inválidas.');
    }
  });


  return { handleSubmit, register, errors, isPending };
}
