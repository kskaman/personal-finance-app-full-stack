import { yupResolver } from "@hookform/resolvers/yup";
import { Box, lighten, Stack, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import ModalTextField from "../../ui/ModalTextField";
import Button from "../../ui/Button";

import PasswordTextField from "../../ui/PasswordTextField";
import { Link, useNavigate } from "react-router";
import { warning, grey500, grey900, white } from "../../theme/colors";
import SetTitle from "../../ui/SetTitle";
import { useState } from "react";

import {
  login as loginApi,
  me,
  resendVerification,
} from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { isAxiosError } from "axios";

interface FormValues {
  email: string;
  password: string;
}

const buildSchema = () =>
  yup.object({
    email: yup.string().required("Email is required"),
    password: yup.string().required("Password is required"),
  });

const LoginForm = () => {
  const navigate = useNavigate();

  const [msg, setMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerifyLink, setShowVerifyLink] = useState(false);

  const { setUser } = useAuth();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(buildSchema()),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(null);
    setShowVerifyLink(false);
    setMsg(null);
    try {
      await loginApi(data);
      const { data: user } = await me();
      setUser(user);
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        // backend sends { message: string }
        setErrorMessage(err.response?.data?.message ?? "Server error");
        // if 403 or 400 for unverified email:
        if (err.response?.status === 403) {
          setShowVerifyLink(true);
        }
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(getValues("email"));
      setShowVerifyLink(false);
      setMsg("If your email is registered, a verification link has been sent.");
      reset();
    } catch {
      setErrorMessage("Could not send verification email.");
    }
  };

  return (
    <>
      <SetTitle title={"Login"} />
      <Typography fontSize="32px" fontWeight="bold">
        Login
      </Typography>

      <Box height="56px">
        {msg && (
          <Typography fontSize="14px" align="center" color={warning}>
            {msg}
          </Typography>
        )}
        {errorMessage && (
          <Typography fontSize="14px" align="center" color={warning}>
            {errorMessage}
          </Typography>
        )}
        {showVerifyLink && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              color: getValues("email") ? grey900 : grey500,
              cursor: getValues("email") ? "pointer" : "not-allowed",
              pointerEvents: getValues("email") ? "auto" : "none",
              textDecoration: "underline",
            }}
            onClick={() => {
              if (getValues("email")) {
                handleResend();
              }
            }}
          >
            Resend verification email
          </Box>
        )}
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="20px">
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ModalTextField
                value={field.value}
                onChange={field.onChange}
                error={error}
                label="Email"
                placeholder=""
                adornmentTextFlag={false}
                color={grey900}
                adornmentColor={grey500}
              />
            )}
          />
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
              {isSubmitting ? "..." : "Log in"}
            </Typography>
          </Button>
        </Stack>
      </form>

      {/* "Forgot password?" */}
      <Stack gap={1} margin="auto" direction="row" alignItems="center">
        <Link to="/auth/forgot-password">
          <Typography
            fontWeight="bold"
            color={grey900}
            sx={{ textDecoration: "underline" }}
          >
            Forgot Password?
          </Typography>
        </Link>
      </Stack>

      {/* “Sign‑up” */}
      <Stack gap={1} margin="auto" direction="row">
        <Typography fontSize="14px" color={grey500}>
          Need to create an account?
        </Typography>
        <Link to="/auth/signup">
          <Typography
            fontWeight="bold"
            color={grey900}
            sx={{ textDecoration: "underline" }}
          >
            Sign Up
          </Typography>
        </Link>
      </Stack>
    </>
  );
};

export default LoginForm;
