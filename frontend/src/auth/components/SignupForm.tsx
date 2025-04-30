import { yupResolver } from "@hookform/resolvers/yup";
import { Box, lighten, Stack, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import Button from "../../ui/Button";
import { useState } from "react";
import { warning, green, grey500, grey900, white } from "../../theme/colors";
import ModalTextField from "../../ui/ModalTextField";
import PasswordTextField from "../../ui/PasswordTextField";
import SetTitle from "../../ui/SetTitle";
import { Link } from "react-router";

import { signup as signupApi } from "../services/authService";
import { isAxiosError } from "axios";

interface FormValues {
  email: string;
  password: string;
}

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@_])[A-Za-z\d#@_]{8,20}$/;

const buildSchema = () =>
  yup.object({
    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email"),
    password: yup
      .string()
      .required("Password is required")
      .matches(passwordRegex, "Password does not meet criteria"),
  });

const SignupForm = () => {
  const {
    control,
    handleSubmit,
    reset,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await signupApi(data);
      setSuccessMessage(res.data.message);
      reset();
    } catch (err) {
      if (isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Signup failed");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <SetTitle title={"Sign Up"} />
      <Typography fontSize="32px" fontWeight="bold">
        Sign Up
      </Typography>

      <Box height={"32px"} width={"100%"} maxWidth="396px" mx="auto">
        {successMessage && (
          <Typography fontSize="14px" align="center" color={green}>
            {successMessage}
          </Typography>
        )}
        {errorMessage && (
          <Typography fontSize="14px" align="center" color={warning}>
            {errorMessage}
          </Typography>
        )}
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="20px">
          {/* Email Field */}
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
          {/* Password Field */}
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
          {/* Password instructions */}
          <Typography fontSize="14px" color={grey500}>
            Your password must be 8 to 20 characters long and include at least
            one uppercase letter, one lowercase letter, one digit, and at least
            one of the following special characters: #, @, or _
          </Typography>

          {/* Signup Button */}
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
              {isSubmitting ? "..." : "Create Account"}
            </Typography>
          </Button>
        </Stack>
      </form>

      {/* Login */}
      <Stack gap={1} margin="auto" direction="row">
        <Typography fontSize="14px" color={grey500}>
          Already have an account?
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

export default SignupForm;
