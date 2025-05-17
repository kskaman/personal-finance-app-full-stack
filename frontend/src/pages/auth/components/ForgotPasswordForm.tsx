import { Box, lighten, Stack, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ModalTextField from "../../../ui/ModalTextField";
import Button from "../../../ui/Button";
import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { grey500, grey900, white } from "../../../theme/colors";
import SetTitle from "../../../ui/SetTitle";
import { Link } from "react-router";
import { isAxiosError } from "axios";

import { forgotPassword as forgotApi } from "../../../services/authService";

interface FormValues {
  email: string;
}

const buildSchema = () =>
  yup.object({
    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid Email"),
  });

const ForgotPasswordForm = () => {
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
    },
  });

  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setMessage(null);
    setErrorMessage(null);
    try {
      const res = await forgotApi(data.email);
      setMessage(res.data.message);
      reset();
    } catch (err) {
      if (isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Request failed");
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      <SetTitle title={"Forgot Password"} />

      <Typography fontSize="32px" fontWeight="bold">
        Forgot Password
      </Typography>

      <Box height={"32px"} width={"100%"} mx="auto">
        {message && (
          <Typography fontSize="14px" align="center" color="green">
            {message}
          </Typography>
        )}
        {errorMessage && (
          <Typography fontSize="14px" align="center" color="warning">
            {errorMessage}
          </Typography>
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
                onBlur={field.onBlur}
                label="Email"
                placeholder=""
                error={error}
                adornmentTextFlag={false}
                color={grey900}
                adornmentColor={grey500}
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
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Typography>
          </Button>
        </Stack>
      </form>

      {/* Login */}
      <Stack gap={1} margin="auto" direction="row">
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

export default ForgotPasswordForm;
