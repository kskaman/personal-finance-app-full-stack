import { useSearchParams } from "react-router";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { api } from "../../api/api";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "../../ui/Button";
import { grey500, grey900, white } from "../../theme/colors";
import { lighten } from "@mui/material";
import { AxiosError } from "axios";
import { Link } from "react-router";
import PasswordTextField from "../../ui/PasswordTextField";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@_])[A-Za-z\d#@_]{8,20}$/;

interface FormValues {
  password: string;
  confirmPassword: string;
}

const schema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .matches(passwordRegex, "Password does not meet criteria"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const ResetPasswordForm = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [msg, setMsg] = useState("");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: data.password,
      });
      setMsg("Password reset successful. You can now log in.");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setMsg(error.response?.data?.message ?? "Reset failed");
    }
  };

  return (
    <>
      <Typography fontSize="32px" fontWeight="bold">
        Reset Password
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <PasswordTextField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={error}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <PasswordTextField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={error}
              />
            )}
          />

          {/* Password instructions */}
          <Typography fontSize="14px" color={grey500}>
            Your password must be 8 to 20 characters long and include at least
            one uppercase letter, one lowercase letter, one digit, and at least
            one of the following special characters: #, @, or _
          </Typography>

          <Button
            type="submit"
            width="100%"
            height="53px"
            backgroundColor={grey900}
            onClick={() => {}}
            color={white}
            hoverColor={white}
            hoverBgColor={lighten(grey900, 0.2)}
          >
            <Typography fontSize="14px" fontWeight="bold">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Typography>
          </Button>
          {msg && (
            <Typography textAlign="center" color={grey900}>
              {msg}
            </Typography>
          )}
        </Stack>
      </form>

      {/* Login Link */}
      <Stack gap={1} margin="auto" direction="row" mt={3}>
        <Typography fontSize="14px" color={grey500}>
          Go to
        </Typography>
        <Link to="/auth/login">
          <Typography
            fontWeight="bold"
            color={grey900}
            sx={{ textDecoration: "underline" }}
          >
            Log In
          </Typography>
        </Link>
      </Stack>
    </>
  );
};

export default ResetPasswordForm;
