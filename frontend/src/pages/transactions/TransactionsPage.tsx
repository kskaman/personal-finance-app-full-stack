import { Box, Stack, Typography, useTheme } from "@mui/material";
import SetTitle from "../../ui/SetTitle";
import PageDiv from "../../ui/PageDiv";
import SubContainer from "../../ui/SubContainer";
import TransactionsTable from "./components/TransactionsTable";
import PageNav from "./components/PageNav";
import { useCallback, useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import useParentWidth from "../../customHooks/useParentWidth";
import Button from "../../ui/Button";
import useModal from "../../customHooks/useModal";
import DeleteModal from "../../ui/DeleteModal";

import AddEditTransactionModal from "./components/AddEditTransactionModal";
import {
  convertDateObjectToString,
  convertDateToDateObject,
  formatDecimalNumber,
  getRandomColor,
} from "../../utils/utilityFunctions";
import EmptyStatePage from "../../ui/EmptyStatePage";
import Filter from "../../ui/Filter";
import { RecurringBill, Transaction } from "../../types/models";

import { SettingsContext } from "../settings/context/SettingsContext";
import {
  useAddTx,
  useEditTx,
  useRemoveTx,
  useTransactions,
  useTxnStats,
} from "./hooks/useTransactions";
import { useBills } from "../recurringBills/hooks/useBills";
import DotLoader from "../../ui/DotLoader";

// Interfaces and Props
interface FormValues {
  txnName: string;
  category: string;
  date: string;
  amount: string;
  paymentType: "oneTime" | "recurring";
  paymentDirection: "paid" | "received";
  recurringId?: string;
  dueDate?: string;
}

type SearchParams = {
  page: string;
  searchName: string;
  sortBy: "Latest" | "Oldest" | "A to Z" | "Z to A" | "Highest" | "Lowest";
  category: string;
  selectedMonth: string;
};

const PER_PAGE = 10;

// Main Page component
const TransactionsPage = () => {
  const theme = useTheme();
  const { containerRef, parentWidth } = useParentWidth();

  const currencySymbol = useContext(SettingsContext).selectedCurrency;

  const [params, setParams] = useSearchParams({
    page: "1",
    searchName: "",
    sortBy: "Latest",
    category: "All Transactions",
    month: "All",
  });

  const qp = {
    page: Number(params.get("page")!),
    searchName: params.get("searchName")!,
    sortBy: params.get("sortBy")! as SearchParams["sortBy"],
    category: params.get("category")!,
    month: params.get("month")!,
  } as const;

  const setFilter = useCallback(
    (k: keyof typeof qp, v: string) =>
      setParams((prev) => ({ ...Object.fromEntries(prev), [k]: v, page: "1" })),
    [setParams]
  );

  const {
    data: txnData = { transactions: [], total: 0 },
    isLoading,
    isError,
    refetch: txnRefetch,
  } = useTransactions({ params: qp });
  const { transactions, total } = txnData;

  const {
    data: recurringBills,
    isLoading: isBillLoading,
    isError: isBillError,
    refetch: billRefetch,
  } = useBills();

  const {
    data: txStats = { total: 0, monthOptions: [] },
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: statsRefetch,
  } = useTxnStats();

  const addTxMutation = useAddTx();
  const editTxMutation = useEditTx();
  const removeTxMutation = useRemoveTx();

  const recurringOptions = useMemo(() => {
    if (!recurringBills) return [];

    return recurringBills.map((bill: RecurringBill) => ({
      value: `${bill.id}`,
      label: `${bill.name} - ${currencySymbol}${Math.abs(bill.amount)}`,
      dueDate: bill.dueDate,
      category: bill.category,
      name: bill.name,
      amount: formatDecimalNumber(Math.abs(bill.amount)),
    }));
  }, [recurringBills, currencySymbol]);

  const pageCount = Math.ceil(total / PER_PAGE);
  const setPage = (p: number) => {
    if (p < 1 || p > pageCount) return;
    setParams((prev) => ({ ...Object.fromEntries(prev), page: String(p) }));
  };
  // Modal management hooks
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const {
    isOpen: isAddModalOpen,
    openModal: openAddModal,
    closeModal: closeAddModal,
  } = useModal();

  const [selectedTnx, setSelectedTnx] = useState<Transaction | null>(null);

  // Handle transaction delete functionality
  const handleDeleteTnx = useCallback(() => {
    if (selectedTnx === null) return;

    removeTxMutation.mutate(selectedTnx.id);
    setSelectedTnx(null);
  }, [removeTxMutation, selectedTnx]);

  // Function to add a transaction.
  const handleAddTransaction = useCallback(
    (formData: FormValues) => {
      const amt = parseFloat(formData.amount);

      addTxMutation.mutate({
        name: formData.txnName,
        category: formData.category,
        date: convertDateToDateObject(formData.date),
        amount:
          formData.paymentType === "recurring"
            ? -Math.abs(amt)
            : formData.paymentDirection === "paid"
            ? -Math.abs(amt)
            : Math.abs(amt),
        recurring: formData.paymentType === "recurring" ? true : false,
        recurringId:
          formData.paymentType === "recurring"
            ? formData.recurringId ?? undefined
            : undefined,
        dueDate:
          formData.paymentType === "recurring"
            ? formData.dueDate ?? undefined
            : undefined,
        theme: getRandomColor(),
      });
    },
    [addTxMutation]
  );

  // Function to edit a transaction.
  const handleEditTransaction = useCallback(
    (formData: FormValues) => {
      const amt = parseFloat(formData.amount);
      if (!selectedTnx) return; // safety check
      editTxMutation.mutate({
        id: selectedTnx.id,
        payload: {
          name: formData.txnName,
          category: formData.category,
          date: convertDateToDateObject(formData.date),
          amount:
            formData.paymentType === "recurring"
              ? -Math.abs(amt)
              : formData.paymentDirection === "paid"
              ? -Math.abs(amt)
              : Math.abs(amt),
          recurring: formData.paymentType === "recurring",
          recurringId:
            formData.paymentType === "recurring"
              ? formData.recurringId ?? undefined
              : undefined,
          dueDate:
            formData.paymentType === "recurring"
              ? formData.dueDate ?? undefined
              : undefined,
          theme: selectedTnx.theme,
        },
      });
      setSelectedTnx(null);
    },
    [editTxMutation, selectedTnx]
  );

  if (isLoading || isBillLoading || isStatsLoading) {
    return <DotLoader />;
  }

  if (isError || isBillError || isStatsError) {
    return (
      <EmptyStatePage
        message="Unable to fetch bills"
        subText="Check your connection and retry."
        buttonLabel="Retry"
        onButtonClick={() => {
          txnRefetch();
          billRefetch();
          statsRefetch();
        }}
      />
    );
  }

  /* Empty Page for no transactions */
  if (txStats.total === 0) {
    return (
      <>
        <EmptyStatePage
          message="No Transactions Yet"
          subText="Add your first transaction..."
          buttonLabel="Add Transaction"
          onButtonClick={() => openAddModal()}
        />
        {isAddModalOpen && (
          <AddEditTransactionModal
            open={isAddModalOpen}
            onClose={closeAddModal}
            onSubmit={(formData: FormValues) => {
              handleAddTransaction(formData);
              closeAddModal();
            }}
            recurringOptions={recurringOptions}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SetTitle title="Transactions" />
      <Box ref={containerRef}>
        <PageDiv>
          <Stack direction="column" gap="32px">
            <Stack direction="row" justifyContent="space-between">
              <Typography
                width="100%"
                height="56px"
                fontSize="32px"
                fontWeight="bold"
                color={theme.palette.primary.main}
              >
                Transactions
              </Typography>
              <Button
                height="53px"
                padding="16px"
                backgroundColor={theme.palette.primary.main}
                color={theme.palette.text.primary}
                onClick={openAddModal}
                hoverColor={theme.palette.text.primary}
                hoverBgColor={theme.palette.primary.light}
              >
                <Typography noWrap fontSize="14px" fontWeight="bold">
                  {parentWidth < 450 ? "+" : "+ Add New Transaction"}
                </Typography>
              </Button>
            </Stack>
            <SubContainer>
              <Filter
                parentWidth={parentWidth}
                searchName={qp.searchName}
                setSearchName={(v: string) => setFilter("searchName", v)}
                category={qp.category}
                setCategory={(v: string) => setFilter("category", v)}
                sortBy={qp.sortBy}
                setSortBy={(v: string) => setFilter("sortBy", v)}
                selectedMonth={qp.month}
                setSelectedMonth={(v: string) => setFilter("month", v)}
                monthOptions={txStats.monthOptions}
              />
              <TransactionsTable
                txns={transactions}
                parentWidth={parentWidth}
                setDeleteModalOpen={(txn: Transaction) => {
                  setSelectedTnx(txn);
                  openDeleteModal();
                }}
                setEditModalOpen={(txn: Transaction) => {
                  setSelectedTnx(txn);
                  openEditModal();
                }}
              />

              <PageNav
                numbers={Array.from({ length: pageCount }, (_, i) => i + 1)}
                selectedPage={qp.page}
                handlePageSelect={setPage}
                parentWidth={parentWidth}
              />
            </SubContainer>
          </Stack>
        </PageDiv>

        {selectedTnx && isDeleteModalOpen && (
          <DeleteModal
            open={isDeleteModalOpen}
            onClose={() => {
              setSelectedTnx(null);
              closeDeleteModal();
            }}
            handleDelete={() => handleDeleteTnx()}
            label="Transaction"
            type="transaction"
          />
        )}

        {isAddModalOpen && (
          <AddEditTransactionModal
            open={isAddModalOpen}
            onClose={closeAddModal}
            onSubmit={(formData: FormValues) => {
              handleAddTransaction(formData);
              closeAddModal();
            }}
            recurringOptions={recurringOptions}
          />
        )}

        {selectedTnx && isEditModalOpen && (
          <AddEditTransactionModal
            open={isEditModalOpen}
            onClose={() => {
              setSelectedTnx(null);
              closeEditModal();
            }}
            onSubmit={(formData: FormValues) => {
              handleEditTransaction(formData);
              closeEditModal();
            }}
            recurringOptions={recurringOptions}
            txnData={{
              txnName: selectedTnx.name,
              category: selectedTnx.category,
              date: convertDateObjectToString(selectedTnx.date),
              amount: formatDecimalNumber(
                Math.abs(selectedTnx.amount)
              ).toString(),
              paymentDirection: selectedTnx.amount < 0 ? "paid" : "received",
              paymentType: selectedTnx.recurring ? "recurring" : "oneTime",
              recurringId: selectedTnx.recurringId || "",
            }}
          />
        )}
      </Box>
    </>
  );
};

export default TransactionsPage;
