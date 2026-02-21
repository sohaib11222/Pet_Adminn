import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, InputNumber, Modal, Select, Switch, Table } from "antd";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import PropTypes from "prop-types";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { itemRender, onShowSizeChange } from "../Pagination";
import {
  plusicon,
  refreshicon,
  searchnormal,
} from "../imagepath";

import { apiRequest, getApiBaseUrl } from "../../api/client";

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString();
  } catch (e) {
    return String(value);
  }
};

const upper = (v) => (v ? String(v).toUpperCase() : "");

const getStatusBadgeClass = (status) => {
  const s = upper(status);
  if (s === "APPROVED" || s === "ACTIVE" || s === "COMPLETED") return "custom-badge status-green";
  if (s === "PENDING") return "custom-badge status-orange";
  if (s === "BLOCKED") return "custom-badge status-pink";
  if (s === "REJECTED" || s === "CANCELLED") return "custom-badge status-gray";
  return "custom-badge status-green";
};

const buildCommonDatasource = (prefix) =>
  Array.from({ length: 8 }).map((_, idx) => ({
    _id: `${prefix}-${idx + 1}`,
    name: `${prefix} Item ${idx + 1}`,
    status: idx % 3 === 0 ? "PENDING" : idx % 3 === 1 ? "APPROVED" : "BLOCKED",
    createdAt: `2026-02-${String(idx + 10).padStart(2, "0")}`,
  }));

const AdminEntityListPage = ({ entity }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const [isResetting, setIsResetting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [petActiveFilter, setPetActiveFilter] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("");
  const [includeInactiveFilter, setIncludeInactiveFilter] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("");
  const [appointmentPaymentStatusFilter, setAppointmentPaymentStatusFilter] = useState("");
  const [appointmentFromDateFilter, setAppointmentFromDateFilter] = useState("");
  const [appointmentToDateFilter, setAppointmentToDateFilter] = useState("");
  const [reviewVeterinarianIdFilter, setReviewVeterinarianIdFilter] = useState("");
  const [reviewPetOwnerIdFilter, setReviewPetOwnerIdFilter] = useState("");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("");

  const [planTypeFilter, setPlanTypeFilter] = useState("");
  const [planStatusFilter, setPlanStatusFilter] = useState("");
  const [insuranceIsActiveFilter, setInsuranceIsActiveFilter] = useState("");
  const [announcementPriorityFilter, setAnnouncementPriorityFilter] = useState("");
  const [announcementTypeFilter, setAnnouncementTypeFilter] = useState("");
  const [announcementPinnedFilter, setAnnouncementPinnedFilter] = useState("");
  const [announcementIsActiveFilter, setAnnouncementIsActiveFilter] = useState("");

  const [petStoreKindFilter, setPetStoreKindFilter] = useState("");
  const [petStoreCityFilter, setPetStoreCityFilter] = useState("");

  const [productIsActiveFilter, setProductIsActiveFilter] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productSellerTypeFilter, setProductSellerTypeFilter] = useState("");
  const [productPetTypeFilter, setProductPetTypeFilter] = useState("");

  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderPaymentStatusFilter, setOrderPaymentStatusFilter] = useState("");
  const [orderPetStoreIdFilter, setOrderPetStoreIdFilter] = useState("");
  const [orderPetOwnerIdFilter, setOrderPetOwnerIdFilter] = useState("");

  const [transactionStatusFilter, setTransactionStatusFilter] = useState("");
  const [transactionProviderFilter, setTransactionProviderFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [transactionFromDateFilter, setTransactionFromDateFilter] = useState("");
  const [transactionToDateFilter, setTransactionToDateFilter] = useState("");

  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("");

  const [vaccineModalOpen, setVaccineModalOpen] = useState(false);
  const [vaccineEditing, setVaccineEditing] = useState(null);
  const [vaccineSaving, setVaccineSaving] = useState(false);
  const [vaccineForm] = Form.useForm();

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planEditing, setPlanEditing] = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [planForm] = Form.useForm();

  const [specializationModalOpen, setSpecializationModalOpen] = useState(false);
  const [specializationEditing, setSpecializationEditing] = useState(null);
  const [specializationSaving, setSpecializationSaving] = useState(false);
  const [specializationForm] = Form.useForm();

  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [insuranceEditing, setInsuranceEditing] = useState(null);
  const [insuranceSaving, setInsuranceSaving] = useState(false);
  const [insuranceForm] = Form.useForm();

  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementEditing, setAnnouncementEditing] = useState(null);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementForm] = Form.useForm();

  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [subscriptionPlanOptions, setSubscriptionPlanOptions] = useState([]);

  const [uploading, setUploading] = useState(false);

  const productImagesPickerRef = useRef(null);
  const petStoreLogoPickerRef = useRef(null);

  const specializationIconPickerRef = useRef(null);
  const insuranceLogoPickerRef = useRef(null);
  const announcementImagePickerRef = useRef(null);
  const announcementFilePickerRef = useRef(null);

  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [appointmentDetailsLoading, setAppointmentDetailsLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productEditing, setProductEditing] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productForm] = Form.useForm();

  const [petStoreModalOpen, setPetStoreModalOpen] = useState(false);
  const [petStoreEditing, setPetStoreEditing] = useState(null);
  const [petStoreSaving, setPetStoreSaving] = useState(false);
  const [petStoreForm] = Form.useForm();

  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  const [transactionDetailsLoading, setTransactionDetailsLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  const [withdrawalApproveOpen, setWithdrawalApproveOpen] = useState(false);
  const [withdrawalRejectOpen, setWithdrawalRejectOpen] = useState(false);
  const [withdrawalActing, setWithdrawalActing] = useState(null);
  const [withdrawalActingLoading, setWithdrawalActingLoading] = useState(false);
  const [withdrawalFeePercent, setWithdrawalFeePercent] = useState(null);
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState("");

  const publicBaseUrl = useMemo(() => {
    const base = getApiBaseUrl();
    return base.replace(/\/api\/?$/, "");
  }, []);

  const toPublicUrl = (value) => {
    if (!value) return "";
    const v = String(value);
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    if (v.startsWith("/")) return `${publicBaseUrl}${v}`;
    return `${publicBaseUrl}/${v}`;
  };

  const openAddProduct = () => {
    setProductEditing(null);
    productForm.setFieldsValue({
      name: "",
      description: "",
      sku: "",
      price: 0,
      discountPrice: null,
      stock: 0,
      category: "",
      subCategory: "",
      petType: [],
      tags: "",
      requiresPrescription: false,
      isActive: true,
      images: [],
    });
    setProductModalOpen(true);
  };

  const openEditProduct = (record) => {
    if (!record) return;
    setProductEditing(record);
    productForm.setFieldsValue({
      name: record?.name || "",
      description: record?.description || "",
      sku: record?.sku || "",
      price: Number(record?.price || 0),
      discountPrice: record?.discountPrice === null || record?.discountPrice === undefined ? null : Number(record.discountPrice),
      stock: Number(record?.stock || 0),
      category: record?.category || "",
      subCategory: record?.subCategory || "",
      petType: Array.isArray(record?.petType) ? record.petType : [],
      tags: Array.isArray(record?.tags) ? record.tags.join(",") : record?.tags || "",
      requiresPrescription: Boolean(record?.requiresPrescription),
      isActive: Boolean(record?.isActive !== false),
      images: Array.isArray(record?.images) ? record.images : [],
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    setError("");
    setProductSaving(true);
    try {
      const values = await productForm.validateFields();
      const tags = String(values.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: values.name,
        description: values.description || null,
        sku: values.sku || undefined,
        price: Number(values.price || 0),
        discountPrice: values.discountPrice === null || values.discountPrice === undefined || values.discountPrice === "" ? null : Number(values.discountPrice),
        stock: Number(values.stock || 0),
        category: values.category || null,
        subCategory: values.subCategory || null,
        petType: Array.isArray(values.petType) ? values.petType : [],
        tags,
        requiresPrescription: Boolean(values.requiresPrescription),
        isActive: Boolean(values.isActive),
        images: Array.isArray(values.images) ? values.images : [],
      };

      if (productEditing?._id) {
        await apiRequest(`/products/${productEditing._id}`, { method: "PUT", body: payload });
      } else {
        await apiRequest("/products", { method: "POST", body: payload });
      }

      setProductModalOpen(false);
      setProductEditing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to save product");
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this product?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const openAddPetStore = () => {
    setPetStoreEditing(null);
    petStoreForm.setFieldsValue({
      ownerId: "",
      name: "",
      logo: "",
      phone: "",
      addressLine1: "",
      addressCity: "",
      addressState: "",
      addressCountry: "",
      addressZip: "",
      isActive: true,
    });
    setPetStoreModalOpen(true);
  };

  const openEditPetStore = (record) => {
    if (!record) return;
    setPetStoreEditing(record);
    petStoreForm.setFieldsValue({
      ownerId: record?.ownerId?._id || record?.ownerId || "",
      name: record?.name || "",
      logo: record?.logo || "",
      phone: record?.phone || "",
      addressLine1: record?.address?.line1 || "",
      addressCity: record?.address?.city || "",
      addressState: record?.address?.state || "",
      addressCountry: record?.address?.country || "",
      addressZip: record?.address?.zip || "",
      isActive: Boolean(record?.isActive !== false),
    });
    setPetStoreModalOpen(true);
  };

  const handleSavePetStore = async () => {
    setError("");
    setPetStoreSaving(true);
    try {
      const values = await petStoreForm.validateFields();
      const payload = {
        ownerId: values.ownerId || undefined,
        name: values.name,
        logo: values.logo || null,
        phone: values.phone || null,
        address: {
          line1: values.addressLine1 || null,
          city: values.addressCity || null,
          state: values.addressState || null,
          country: values.addressCountry || null,
          zip: values.addressZip || null,
        },
        isActive: Boolean(values.isActive),
      };

      if (petStoreEditing?._id) {
        await apiRequest(`/pet-stores/${petStoreEditing._id}`, { method: "PUT", body: payload });
      } else {
        await apiRequest("/pet-stores", { method: "POST", body: payload });
      }

      setPetStoreModalOpen(false);
      setPetStoreEditing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to save pet store");
    } finally {
      setPetStoreSaving(false);
    }
  };

  const handleDeletePetStore = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this pet store?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/pet-stores/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to delete pet store");
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetails = async (record) => {
    const id = record?._id;
    if (!id) return;
    setError("");
    setOrderDetailsOpen(true);
    setOrderDetailsLoading(true);
    setOrderDetails(null);
    try {
      const res = await apiRequest(`/orders/${id}`, { timeoutMs: 60000 });
      const ord = res?.data || res;
      setOrderDetails(ord || null);
    } catch (e) {
      setError(e?.message || "Failed to load order details");
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    if (!id || !status) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/orders/${id}/status`, { method: "PUT", body: { status: upper(status) } });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const openTransactionDetails = async (record) => {
    const id = record?._id;
    if (!id) return;
    setError("");
    setTransactionDetailsOpen(true);
    setTransactionDetailsLoading(true);
    setTransactionDetails(null);
    try {
      const res = await apiRequest(`/transaction/${id}`, { timeoutMs: 60000 });
      const t = res?.data || res;
      setTransactionDetails(t || null);
    } catch (e) {
      setError(e?.message || "Failed to load transaction details");
    } finally {
      setTransactionDetailsLoading(false);
    }
  };

  const handleUpdateTransactionStatus = async (id, status) => {
    if (!id || !status) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/transaction/${id}`, { method: "PUT", body: { status: upper(status) } });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to update transaction status");
    } finally {
      setLoading(false);
    }
  };

  const handleRefundTransaction = async (id) => {
    if (!id) return;
    const ok = window.confirm("Refund this transaction?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/payment/refund/${id}`, { method: "POST" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to refund transaction");
    } finally {
      setLoading(false);
    }
  };

  const openApproveWithdrawal = (record) => {
    if (!record?._id) return;
    const r = String(record?.userId?.role || record?.userRole || record?.role || "").toUpperCase();
    if (r === "PET_STORE") {
      const ok = window.confirm("Approve this PET_STORE withdrawal request? (No withdrawal fee will be applied)");
      if (!ok) return;
      handleApproveWithdrawalDirect(record?._id);
      return;
    }
    setWithdrawalActing(record);
    setWithdrawalFeePercent(null);
    setWithdrawalApproveOpen(true);
  };

  const handleApproveWithdrawalDirect = async (id) => {
    if (!id) return;
    setWithdrawalActingLoading(true);
    setError("");
    try {
      await apiRequest(`/balance/withdraw/${id}/approve`, { method: "POST", body: {} });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to approve withdrawal");
    } finally {
      setWithdrawalActingLoading(false);
    }
  };

  const openRejectWithdrawal = (record) => {
    if (!record?._id) return;
    setWithdrawalActing(record);
    setWithdrawalRejectReason("");
    setWithdrawalRejectOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this user? This cannot be undone.");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/users/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async () => {
    const id = withdrawalActing?._id;
    if (!id) return;
    setWithdrawalActingLoading(true);
    setError("");
    try {
      const body = {};
      if (withdrawalFeePercent !== null && withdrawalFeePercent !== undefined && withdrawalFeePercent !== "") {
        body.withdrawalFeePercent = Number(withdrawalFeePercent);
      }
      await apiRequest(`/balance/withdraw/${id}/approve`, { method: "POST", body });
      setWithdrawalApproveOpen(false);
      setWithdrawalActing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to approve withdrawal");
    } finally {
      setWithdrawalActingLoading(false);
    }
  };

  const handleRejectWithdrawal = async () => {
    const id = withdrawalActing?._id;
    if (!id) return;
    setWithdrawalActingLoading(true);
    setError("");
    try {
      await apiRequest(`/balance/withdraw/${id}/reject`, {
        method: "POST",
        body: { reason: withdrawalRejectReason || "Rejected by admin" },
      });
      setWithdrawalRejectOpen(false);
      setWithdrawalActing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to reject withdrawal");
    } finally {
      setWithdrawalActingLoading(false);
    }
  };

  const uploadSingleFile = async ({ file, endpoint }) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiRequest(endpoint, {
      method: "POST",
      body: formData,
      timeoutMs: 60000,
    });
    return res?.data?.url || "";
  };

  const uploadMultipleFiles = async ({ files, endpoint, fieldName }) => {
    const formData = new FormData();
    (Array.isArray(files) ? files : []).forEach((f) => {
      if (f) formData.append(fieldName, f);
    });
    const res = await apiRequest(endpoint, {
      method: "POST",
      body: formData,
      timeoutMs: 60000,
    });
    const urls = res?.data?.urls;
    return Array.isArray(urls) ? urls : [];
  };

  const handlePickAndUpload = async ({ file, endpoint, form, field }) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadSingleFile({ file, endpoint });
      if (url) {
        form.setFieldsValue({ [field]: url });
      }
    } catch (e) {
      setError(e?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handlePickAndUploadMultiple = async ({ files, endpoint, form, field, fieldName }) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const urls = await uploadMultipleFiles({ files, endpoint, fieldName });
      if (urls.length > 0) {
        form.setFieldsValue({ [field]: urls });
      }
    } catch (e) {
      setError(e?.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  async function fetchData(overrides = {}) {
    const nextPage = overrides.page ?? pagination.page ?? 1;
    const nextLimit = overrides.limit ?? pagination.limit ?? 10;

    const isUsers = entity === "users";
    const isVets = entity === "veterinarians" || entity === "approvalsVets";
    const isPetStoreApprovals = entity === "approvalsPetStores";
    const isPets = entity === "pets";
    const isMedicalRecords = entity === "medicalRecords";
    const isVaccines = entity === "vaccines";
    const isAppointments = entity === "appointments";
    const isReviews = entity === "reviews";
    const isSubscriptionPlans = entity === "subscriptionPlans";
    const isSpecializations = entity === "specializations";
    const isInsuranceCompanies = entity === "insuranceCompanies";
    const isAnnouncements = entity === "announcements";

    const isPetStores = entity === "petStores";
    const isProducts = entity === "products";
    const isOrders = entity === "orders";
    const isTransactions = entity === "transactions";
    const isWithdrawals = entity === "withdrawals";
    const isPayments = entity === "payments";

    if (!isUsers && !isVets && !isPetStoreApprovals && !isPets && !isMedicalRecords && !isVaccines && !isAppointments && !isReviews && !isSubscriptionPlans && !isSpecializations && !isInsuranceCompanies && !isAnnouncements && !isPetStores && !isProducts && !isOrders && !isTransactions && !isWithdrawals && !isPayments) {
      const datasource = buildCommonDatasource(entity);
      setData(datasource);
      setPagination((prev) => ({
        ...prev,
        page: 1,
        limit: datasource.length,
        total: datasource.length,
        pages: 1,
      }));
      return;
    }

    setError("");
    setLoading(true);
    try {
      if (isSubscriptionPlans) {
        const raw = await apiRequest("/subscription-plans", {
          params: {
            planType: planTypeFilter,
            status: planStatusFilter,
          },
        });

        const plans = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const q = String(search || "").trim().toLowerCase();
        const filtered = q
          ? plans.filter((p) => {
              const name = String(p?.name || "").toLowerCase();
              const type = String(p?.planType || "").toLowerCase();
              return name.includes(q) || type.includes(q);
            })
          : plans;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const items = filtered.slice(start, start + nextLimit);

        setData(items);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      if (isSpecializations) {
        const raw = await apiRequest("/specializations");
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const q = String(search || "").trim().toLowerCase();
        const filtered = q
          ? list.filter((s) => {
              const name = String(s?.name || "").toLowerCase();
              const slug = String(s?.slug || "").toLowerCase();
              const desc = String(s?.description || "").toLowerCase();
              return name.includes(q) || slug.includes(q) || desc.includes(q);
            })
          : list;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const items = filtered.slice(start, start + nextLimit);

        setData(items);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      if (isVaccines) {
        const includeInactive = String(includeInactiveFilter).toLowerCase() === "true";
        const raw = await apiRequest("/vaccines", {
          params: includeInactive ? { includeInactive: true } : undefined,
        });

        const vaccines = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const q = String(search || "").trim().toLowerCase();
        const filtered = q
          ? vaccines.filter((v) => String(v?.name || "").toLowerCase().includes(q))
          : vaccines;

        const limit = nextLimit;
        const page = nextPage;
        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / limit));
        const start = (page - 1) * limit;
        const items = filtered.slice(start, start + limit);

        setData(items);
        setPagination((prev) => ({
          ...prev,
          page,
          limit,
          total,
          pages,
        }));
        return;
      }

      const request = isUsers
        ? {
            path: "/users",
            params: {
              page: nextPage,
              limit: nextLimit,
              search,
              role: roleFilter,
              status: statusFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.users || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isPetStoreApprovals
        ? {
            path: "/users",
            params: {
              page: nextPage,
              limit: nextLimit,
              search,
              status: "PENDING",
              role: roleFilter || "PET_STORE",
            },
            unwrap: (payload) => ({
              items: payload?.data?.users || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isPets
        ? {
            path: "/admin/pets",
            params: {
              page: nextPage,
              limit: nextLimit,
              search,
              species: speciesFilter,
              isActive: petActiveFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.pets || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isMedicalRecords
        ? {
            path: "/admin/medical-records",
            params: {
              page: nextPage,
              limit: nextLimit,
              search,
              recordType: recordTypeFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.records || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isAppointments
        ? {
            path: "/admin/appointments",
            params: {
              page: nextPage,
              limit: nextLimit,
              appointmentNumber: search,
              status: appointmentStatusFilter,
              paymentStatus: appointmentPaymentStatusFilter,
              fromDate: appointmentFromDateFilter,
              toDate: appointmentToDateFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.appointments || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isReviews
        ? {
            path: "/admin/reviews",
            params: {
              page: search ? 1 : nextPage,
              limit: search ? 500 : nextLimit,
              veterinarianId: reviewVeterinarianIdFilter,
              petOwnerId: reviewPetOwnerIdFilter,
              rating: reviewRatingFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.reviews || [],
              pageInfo: payload?.data?.pagination,
            }),
            clientSideSearch: Boolean(search),
          }
        : isInsuranceCompanies
        ? {
            path: "/insurance/admin/all",
            params: {
              page: search ? 1 : nextPage,
              limit: search ? 500 : nextLimit,
              isActive: insuranceIsActiveFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.companies || [],
              pageInfo: payload?.data?.pagination,
            }),
            clientSideSearch: Boolean(search),
          }
        : isAnnouncements
        ? {
            path: "/announcements",
            params: {
              page: search ? 1 : nextPage,
              limit: search ? 500 : nextLimit,
              priority: announcementPriorityFilter,
              announcementType: announcementTypeFilter,
              isPinned: announcementPinnedFilter,
              isActive: announcementIsActiveFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.announcements || [],
              pageInfo: payload?.data?.pagination,
            }),
            clientSideSearch: Boolean(search),
          }
        : isPetStores
        ? {
            path: "/pet-stores",
            params: {
              page: nextPage,
              limit: nextLimit,
              search,
              kind: petStoreKindFilter,
              city: petStoreCityFilter,
              includeInactive: true,
            },
            unwrap: (payload) => ({
              items: payload?.data?.petStores || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isProducts
        ? {
            path: "/products",
            params: {
              page: nextPage,
              limit: nextLimit,
              search,
              isActive: productIsActiveFilter,
              category: productCategoryFilter || undefined,
              sellerType: productSellerTypeFilter || undefined,
              petType: productPetTypeFilter || undefined,
            },
            unwrap: (payload) => ({
              items: payload?.data?.products || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isOrders
        ? {
            path: "/orders",
            params: {
              page: search ? 1 : nextPage,
              limit: search ? 500 : nextLimit,
              status: orderStatusFilter,
              paymentStatus: orderPaymentStatusFilter,
              petStoreId: orderPetStoreIdFilter || undefined,
              petOwnerId: orderPetOwnerIdFilter || undefined,
            },
            unwrap: (payload) => ({
              items: payload?.data?.orders || [],
              pageInfo: payload?.data?.pagination,
            }),
            clientSideSearch: Boolean(search),
          }
        : isTransactions
        ? {
            path: "/transaction",
            params: {
              page: nextPage,
              limit: nextLimit,
              status: transactionStatusFilter,
              provider: transactionProviderFilter,
              type: transactionTypeFilter,
              fromDate: transactionFromDateFilter,
              toDate: transactionToDateFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.transactions || [],
              pageInfo: payload?.data?.pagination,
            }),
          }
        : isPayments
        ? {
            path: "/payment/transactions",
            params: {
              page: search ? 1 : nextPage,
              limit: search ? 500 : nextLimit,
              status: transactionStatusFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.transactions || [],
              pageInfo: payload?.data?.pagination,
            }),
            clientSideSearch: Boolean(search),
          }
        : isWithdrawals
        ? {
            path: "/balance/withdraw/requests",
            params: {
              page: search ? 1 : nextPage,
              limit: search ? 500 : nextLimit,
              status: withdrawalStatusFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.requests || [],
              pageInfo: payload?.data?.pagination,
            }),
            clientSideSearch: Boolean(search),
          }
        : {
            path: "/users/veterinarians",
            params: {
              page: nextPage,
              limit: nextLimit,
              search,
              status: entity === "approvalsVets" ? "PENDING" : statusFilter,
              subscriptionStatus: subscriptionStatusFilter,
            },
            unwrap: (payload) => ({
              items: payload?.data?.veterinarians || [],
              pageInfo: payload?.data?.pagination,
            }),
          };
      const res = await apiRequest(request.path, { params: request.params });
      const { items, pageInfo } = request.unwrap(res);

      if (request.clientSideSearch && isPayments) {
        const q = String(search || "").trim().toLowerCase();
        const list = Array.isArray(items) ? items : [];
        const filtered = q
          ? list.filter((t) => {
              const id = String(t?._id || "").toLowerCase();
              const status = String(t?.status || "").toLowerCase();
              const provider = String(t?.provider || "").toLowerCase();
              const ref = String(t?.providerReference || "").toLowerCase();
              return id.includes(q) || status.includes(q) || provider.includes(q) || ref.includes(q);
            })
          : list;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const paged = filtered.slice(start, start + nextLimit);

        setData(paged);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      if (request.clientSideSearch && isOrders) {
        const q = String(search || "").trim().toLowerCase();
        const list = Array.isArray(items) ? items : [];
        const filtered = q
          ? list.filter((o) => {
              const id = String(o?._id || "").toLowerCase();
              const owner = String(o?.petOwnerId?.name || o?.petOwnerId?.email || "").toLowerCase();
              const store = String(o?.petStoreId?.name || "").toLowerCase();
              return id.includes(q) || owner.includes(q) || store.includes(q);
            })
          : list;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const paged = filtered.slice(start, start + nextLimit);

        setData(paged);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      if (request.clientSideSearch && isWithdrawals) {
        const q = String(search || "").trim().toLowerCase();
        const list = Array.isArray(items) ? items : [];
        const filtered = q
          ? list.filter((r) => {
              const id = String(r?._id || "").toLowerCase();
              const user = String(r?.userId?.name || r?.userId?.email || "").toLowerCase();
              const status = String(r?.status || "").toLowerCase();
              return id.includes(q) || user.includes(q) || status.includes(q);
            })
          : list;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const paged = filtered.slice(start, start + nextLimit);

        setData(paged);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      if (request.clientSideSearch && isReviews) {
        const q = String(search || "").trim().toLowerCase();
        const list = Array.isArray(items) ? items : [];
        const filtered = q
          ? list.filter((r) => {
              const vetName = String(r?.veterinarianId?.name || "").toLowerCase();
              const ownerName = String(r?.petOwnerId?.name || "").toLowerCase();
              const petName = String(r?.petId?.name || "").toLowerCase();
              const text = String(r?.reviewText || "").toLowerCase();
              return (
                vetName.includes(q) ||
                ownerName.includes(q) ||
                petName.includes(q) ||
                text.includes(q)
              );
            })
          : list;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const paged = filtered.slice(start, start + nextLimit);

        setData(paged);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      if (request.clientSideSearch && isInsuranceCompanies) {
        const q = String(search || "").trim().toLowerCase();
        const list = Array.isArray(items) ? items : [];
        const filtered = q
          ? list.filter((c) => {
              const name = String(c?.name || "").toLowerCase();
              return name.includes(q);
            })
          : list;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const paged = filtered.slice(start, start + nextLimit);

        setData(paged);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      if (request.clientSideSearch && isAnnouncements) {
        const q = String(search || "").trim().toLowerCase();
        const list = Array.isArray(items) ? items : [];
        const filtered = q
          ? list.filter((a) => {
              const title = String(a?.title || "").toLowerCase();
              const msg = String(a?.message || "").toLowerCase();
              return title.includes(q) || msg.includes(q);
            })
          : list;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / nextLimit));
        const start = (nextPage - 1) * nextLimit;
        const paged = filtered.slice(start, start + nextLimit);

        setData(paged);
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total,
          pages,
        }));
        return;
      }

      setData(Array.isArray(items) ? items : []);
      if (pageInfo) {
        setPagination((prev) => ({
          ...prev,
          page: Number(pageInfo.page || nextPage || 1),
          limit: Number(pageInfo.limit || nextLimit || 10),
          total: Number(pageInfo.total || 0),
          pages: Number(pageInfo.pages || 0),
        }));
      } else {
        setPagination((prev) => ({
          ...prev,
          page: nextPage,
          limit: nextLimit,
          total: Array.isArray(items) ? items.length : 0,
        }));
      }
    } catch (e) {
      setError(e?.message || "Failed to load data");
      setData([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 0 }));
    } finally {
      setLoading(false);
    }
  }

  const openAddVaccine = () => {
    setVaccineEditing(null);
    vaccineForm.setFieldsValue({
      name: "",
      applicableSpecies: [],
      minAgeWeeks: 0,
      dosesRequired: 1,
      isActive: true,
    });
    setVaccineModalOpen(true);
  };

  const openEditVaccine = (record) => {
    if (!record) return;
    setVaccineEditing(record);
    vaccineForm.setFieldsValue({
      name: record?.name || "",
      applicableSpecies: Array.isArray(record?.applicableSpecies) ? record.applicableSpecies : [],
      minAgeWeeks: Number(record?.minAgeWeeks || 0),
      dosesRequired: Number(record?.dosesRequired || 1),
      isActive: Boolean(record?.isActive !== false),
    });
    setVaccineModalOpen(true);
  };

  const handleSaveVaccine = async () => {
    setError("");
    setVaccineSaving(true);
    try {
      const values = await vaccineForm.validateFields();
      const payload = {
        name: values.name,
        applicableSpecies: values.applicableSpecies,
        minAgeWeeks: Number(values.minAgeWeeks || 0),
        dosesRequired: Number(values.dosesRequired || 1),
        isActive: Boolean(values.isActive),
      };

      if (vaccineEditing?._id) {
        await apiRequest(`/vaccines/${vaccineEditing._id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest("/vaccines", {
          method: "POST",
          body: payload,
        });
      }

      setVaccineModalOpen(false);
      setVaccineEditing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to save vaccine");
    } finally {
      setVaccineSaving(false);
    }
  };

  const openAppointmentDetails = async (record) => {
    const id = record?._id;
    if (!id) return;
    setError("");
    setAppointmentDetailsOpen(true);
    setAppointmentDetailsLoading(true);
    setAppointmentDetails(null);
    try {
      const res = await apiRequest(`/appointments/${id}`, { timeoutMs: 60000 });
      const appt = res?.data || res?.appointment || res;
      setAppointmentDetails(appt || null);
    } catch (e) {
      setError(e?.message || "Failed to load appointment details");
    } finally {
      setAppointmentDetailsLoading(false);
    }
  };

  const openEditPlan = (record) => {
    if (!record) return;
    setPlanEditing(record);
    planForm.setFieldsValue({
      price: Number(record?.price || 0),
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (!planEditing?._id) return;
    setError("");
    setPlanSaving(true);
    try {
      const values = await planForm.validateFields();
      await apiRequest(`/subscription-plans/${planEditing._id}`, {
        method: "PUT",
        body: { price: Number(values.price) },
      });
      setPlanModalOpen(false);
      setPlanEditing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to update plan");
    } finally {
      setPlanSaving(false);
    }
  };

  const openAddSpecialization = () => {
    setSpecializationEditing(null);
    specializationForm.setFieldsValue({
      name: "",
      slug: "",
      description: "",
      icon: "",
      type: "",
    });
    setSpecializationModalOpen(true);
  };

  const openEditSpecialization = (record) => {
    if (!record) return;
    setSpecializationEditing(record);
    specializationForm.setFieldsValue({
      name: record?.name || "",
      slug: record?.slug || "",
      description: record?.description || "",
      icon: record?.icon || "",
      type: record?.type || "",
    });
    setSpecializationModalOpen(true);
  };

  const handleSaveSpecialization = async () => {
    setError("");
    setSpecializationSaving(true);
    try {
      const values = await specializationForm.validateFields();
      const payload = {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
        icon: values.icon || undefined,
        type: values.type || undefined,
      };
      if (specializationEditing?._id) {
        await apiRequest(`/specializations/${specializationEditing._id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest("/specializations", {
          method: "POST",
          body: payload,
        });
      }
      setSpecializationModalOpen(false);
      setSpecializationEditing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to save specialization");
    } finally {
      setSpecializationSaving(false);
    }
  };

  const handleDeleteSpecialization = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this specialization?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/specializations/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to delete specialization");
    } finally {
      setLoading(false);
    }
  };

  const openAddInsurance = () => {
    setInsuranceEditing(null);
    insuranceForm.setFieldsValue({
      name: "",
      logo: "",
      isActive: true,
    });
    setInsuranceModalOpen(true);
  };

  const openEditInsurance = (record) => {
    if (!record) return;
    setInsuranceEditing(record);
    insuranceForm.setFieldsValue({
      name: record?.name || "",
      logo: record?.logo || "",
      isActive: Boolean(record?.isActive !== false),
    });
    setInsuranceModalOpen(true);
  };

  const handleSaveInsurance = async () => {
    setError("");
    setInsuranceSaving(true);
    try {
      const values = await insuranceForm.validateFields();
      const payload = {
        name: values.name,
        logo: values.logo || null,
        isActive: Boolean(values.isActive),
      };
      if (insuranceEditing?._id) {
        await apiRequest(`/insurance/${insuranceEditing._id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest("/insurance", {
          method: "POST",
          body: payload,
        });
      }
      setInsuranceModalOpen(false);
      setInsuranceEditing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to save insurance company");
    } finally {
      setInsuranceSaving(false);
    }
  };

  const handleToggleInsurance = async (record) => {
    if (!record?._id) return;
    const next = !record?.isActive;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/insurance/${record._id}/toggle-status`, {
        method: "PUT",
        body: { isActive: next },
      });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInsurance = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this insurance company?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/insurance/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to delete insurance company");
    } finally {
      setLoading(false);
    }
  };

  const openAddAnnouncement = async () => {
    setAnnouncementEditing(null);
    announcementForm.setFieldsValue({
      title: "",
      message: "",
      link: "",
      image: "",
      file: "",
      priority: "NORMAL",
      announcementType: "BROADCAST",
      isPinned: false,
      isActive: true,
      expiryType: "NO_EXPIRY",
      expiryDate: "",
      specializationIds: [],
      subscriptionPlanIds: [],
      locationCity: "",
      locationState: "",
      locationCountry: "",
      individualVeterinarianIds: "",
    });
    setAnnouncementModalOpen(true);

    try {
      const [specRes, planRes] = await Promise.all([
        apiRequest("/specializations"),
        apiRequest("/subscription-plans"),
      ]);
      const specs = Array.isArray(specRes?.data) ? specRes.data : Array.isArray(specRes) ? specRes : [];
      const plans = Array.isArray(planRes?.data) ? planRes.data : Array.isArray(planRes) ? planRes : [];
      setSpecializationOptions(specs);
      setSubscriptionPlanOptions(plans);
    } catch (e) {
      setSpecializationOptions([]);
      setSubscriptionPlanOptions([]);
    }
  };

  const openEditAnnouncement = async (record) => {
    if (!record) return;
    setAnnouncementEditing(record);
    announcementForm.setFieldsValue({
      title: record?.title || "",
      message: record?.message || "",
      link: record?.link || "",
      image: record?.image || "",
      file: record?.file || "",
      priority: record?.priority || "NORMAL",
      announcementType: record?.announcementType || "BROADCAST",
      isPinned: Boolean(record?.isPinned),
      isActive: Boolean(record?.isActive !== false),
      expiryType: record?.expiryType || "NO_EXPIRY",
      expiryDate: record?.expiryDate ? String(record.expiryDate).slice(0, 10) : "",
      specializationIds: Array.isArray(record?.targetCriteria?.specializationIds)
        ? record.targetCriteria.specializationIds.map((x) => x?._id || x)
        : [],
      subscriptionPlanIds: Array.isArray(record?.targetCriteria?.subscriptionPlanIds)
        ? record.targetCriteria.subscriptionPlanIds.map((x) => x?._id || x)
        : [],
      locationCity: record?.targetCriteria?.location?.city || "",
      locationState: record?.targetCriteria?.location?.state || "",
      locationCountry: record?.targetCriteria?.location?.country || "",
      individualVeterinarianIds: Array.isArray(record?.targetCriteria?.individualVeterinarianIds)
        ? record.targetCriteria.individualVeterinarianIds.map((x) => x?._id || x).join(",")
        : "",
    });
    setAnnouncementModalOpen(true);

    try {
      const [specRes, planRes] = await Promise.all([
        apiRequest("/specializations"),
        apiRequest("/subscription-plans"),
      ]);
      const specs = Array.isArray(specRes?.data) ? specRes.data : Array.isArray(specRes) ? specRes : [];
      const plans = Array.isArray(planRes?.data) ? planRes.data : Array.isArray(planRes) ? planRes : [];
      setSpecializationOptions(specs);
      setSubscriptionPlanOptions(plans);
    } catch (e) {
      setSpecializationOptions([]);
      setSubscriptionPlanOptions([]);
    }
  };

  const handleSaveAnnouncement = async () => {
    setError("");
    setAnnouncementSaving(true);
    try {
      const values = await announcementForm.validateFields();
      const vetIds = String(values.individualVeterinarianIds || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: values.title,
        message: values.message,
        link: values.link || null,
        image: values.image || null,
        file: values.file || null,
        priority: values.priority,
        announcementType: values.announcementType,
        isPinned: Boolean(values.isPinned),
        isActive: Boolean(values.isActive),
        expiryType: values.expiryType,
        expiryDate: values.expiryType === "EXPIRE_AFTER_DATE" ? values.expiryDate : null,
        targetCriteria:
          values.announcementType === "TARGETED"
            ? {
                specializationIds: values.specializationIds || [],
                subscriptionPlanIds: values.subscriptionPlanIds || [],
                location: {
                  city: values.locationCity || null,
                  state: values.locationState || null,
                  country: values.locationCountry || null,
                },
                individualVeterinarianIds: vetIds,
              }
            : {},
      };

      if (announcementEditing?._id) {
        await apiRequest(`/announcements/${announcementEditing._id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest("/announcements", {
          method: "POST",
          body: payload,
        });
      }

      setAnnouncementModalOpen(false);
      setAnnouncementEditing(null);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to save announcement");
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this announcement?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/announcements/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to delete announcement");
    } finally {
      setLoading(false);
    }
  };

  async function handleApproveVet(id) {
    if (!id) return;
    setLoading(true);
    try {
      await apiRequest("/auth/approve-veterinarian", {
        method: "POST",
        body: { veterinarianId: id },
      });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to approve veterinarian");
    } finally {
      setLoading(false);
    }
  }

  async function handleRejectVet(id) {
    if (!id) return;
    const reason = window.prompt("Rejection reason (optional):") || undefined;
    setLoading(true);
    try {
      await apiRequest("/auth/reject-veterinarian", {
        method: "POST",
        body: { veterinarianId: id, reason },
      });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to reject veterinarian");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprovePetStore(id) {
    if (!id) return;
    setLoading(true);
    try {
      await apiRequest("/auth/approve-pet-store", {
        method: "POST",
        body: { userId: id },
      });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to approve account");
    } finally {
      setLoading(false);
    }
  }

  async function handleRejectPetStore(id) {
    if (!id) return;
    const reason = window.prompt("Rejection reason (optional):") || undefined;
    setLoading(true);
    try {
      await apiRequest("/auth/reject-pet-store", {
        method: "POST",
        body: { userId: id, reason },
      });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to reject account");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMedicalRecord(id) {
    if (!id) return;
    const ok = window.confirm("Delete this medical record? This cannot be undone.");
    if (!ok) return;
    setLoading(true);
    try {
      await apiRequest(`/admin/medical-records/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to delete medical record");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUserStatus(id, status) {
    if (!id || !status) return;
    setLoading(true);
    try {
      await apiRequest(`/users/status/${id}`, {
        method: "PUT",
        body: { status: upper(status) },
      });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  }

  const { title, section, columns, addPath } = useMemo(() => {
    const baseColumns = [
      {
        title: "Name",
        dataIndex: "name",
        sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
      },
      {
        title: "Status",
        dataIndex: "status",
        sorter: (a, b) => (a?.status || "").length - (b?.status || "").length,
        render: (value) => (
          <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>
        ),
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
      },
    ];

    const map = {
      dashboard: { title: "Dashboard", section: "Main", addPath: "" },
      approvalsVets: {
        title: "Veterinarian Approvals",
        section: "Approvals",
        addPath: "",
      },
      approvalsPetStores: {
        title: "Pet Store Approvals",
        section: "Approvals",
        addPath: "",
      },
      users: { title: "Users", section: "Users", addPath: "" },
      veterinarians: {
        title: "Veterinarians",
        section: "Users",
        addPath: "",
      },
      pets: { title: "Pets", section: "Pets & Care", addPath: "" },
      medicalRecords: {
        title: "Medical Records",
        section: "Pets & Care",
        addPath: "",
      },
      vaccines: { title: "Vaccines", section: "Pets & Care", addPath: "" },
      appointments: {
        title: "Appointments",
        section: "Appointments",
        addPath: "",
      },
      petStores: { title: "Pet Stores", section: "Commerce", addPath: "" },
      products: { title: "Products", section: "Commerce", addPath: "" },
      orders: { title: "Orders", section: "Commerce", addPath: "" },
      transactions: {
        title: "Transactions",
        section: "Finance",
        addPath: "",
      },
      payments: {
        title: "Payments",
        section: "Finance",
        addPath: "",
      },
      withdrawals: {
        title: "Withdrawal Requests",
        section: "Finance",
        addPath: "",
      },
      subscriptions: {
        title: "Subscriptions",
        section: "Subscriptions",
        addPath: "",
      },
      subscriptionPlans: {
        title: "Subscription Plans",
        section: "Subscriptions",
        addPath: "",
      },
      announcements: {
        title: "Announcements",
        section: "Content",
        addPath: "",
      },
      reviews: { title: "Reviews", section: "Content", addPath: "" },
      insuranceCompanies: {
        title: "Insurance Companies",
        section: "Configuration",
        addPath: "",
      },
      specializations: {
        title: "Specializations",
        section: "Configuration",
        addPath: "",
      },
      uploads: { title: "Uploads", section: "Configuration", addPath: "" },
      systemActivity: {
        title: "System Activity",
        section: "Configuration",
        addPath: "",
      },
    };

    const cfg = map[entity] || { title: "Admin", section: "", addPath: "" };

    let columns = baseColumns;

    if (entity === "users") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Email",
          dataIndex: "email",
          sorter: (a, b) => (a?.email || "").length - (b?.email || "").length,
        },
        {
          title: "Phone",
          dataIndex: "phone",
          sorter: (a, b) => (a?.phone || "").length - (b?.phone || "").length,
        },
        {
          title: "Role",
          dataIndex: "role",
          sorter: (a, b) => (a?.role || "").length - (b?.role || "").length,
        },
        {
          title: "Status",
          dataIndex: "status",
          sorter: (a, b) => (a?.status || "").length - (b?.status || "").length,
          render: (value) => (
            <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={() => handleUpdateUserStatus(record?._id, "APPROVED")}
                  disabled={upper(record?.status) === "APPROVED"}
                >
                  Approve
                </button>
                {upper(record?.status) === "BLOCKED" ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-warning"
                    onClick={() => handleUpdateUserStatus(record?._id, "APPROVED")}
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleUpdateUserStatus(record?._id, "BLOCKED")}
                    disabled={upper(record?.status) === "BLOCKED"}
                  >
                    Block
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteUser(record?._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "subscriptionPlans") {
      columns = [
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Type",
          dataIndex: "planType",
          render: (value) => upper(value) || "-",
        },
        {
          title: "Status",
          dataIndex: "status",
          render: (value) => (
            <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>
          ),
        },
        {
          title: "Duration (days)",
          dataIndex: "durationInDays",
        },
        {
          title: "Price",
          dataIndex: "price",
        },
        {
          title: "Features",
          dataIndex: "features",
          render: (value) => (Array.isArray(value) ? value.join(", ") : ""),
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => openEditPlan(record)}
              >
                Edit Price
              </button>
            </div>
          ),
        },
      ];
    }

    if (entity === "specializations") {
      columns = [
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Slug",
          dataIndex: "slug",
        },
        {
          title: "Type",
          dataIndex: "type",
          render: (value) => (value ? String(value) : ""),
        },
        {
          title: "Description",
          dataIndex: "description",
          render: (value) => (value ? String(value) : ""),
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditSpecialization(record)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteSpecialization(record?._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "insuranceCompanies") {
      columns = [
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Logo",
          dataIndex: "logo",
          render: (value) => (value ? String(value) : ""),
        },
        {
          title: "Active",
          dataIndex: "isActive",
          render: (value) => (
            <span className={getStatusBadgeClass(value ? "ACTIVE" : "BLOCKED")}>
              {value ? "ACTIVE" : "INACTIVE"}
            </span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditInsurance(record)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${record?.isActive ? "btn-warning" : "btn-success"}`}
                  onClick={() => handleToggleInsurance(record)}
                >
                  {record?.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteInsurance(record?._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "announcements") {
      columns = [
        {
          title: "Title",
          dataIndex: "title",
          sorter: (a, b) => (a?.title || "").length - (b?.title || "").length,
        },
        {
          title: "Type",
          dataIndex: "announcementType",
          render: (value) => upper(value) || "-",
        },
        {
          title: "Priority",
          dataIndex: "priority",
          render: (value) => upper(value) || "-",
        },
        {
          title: "Pinned",
          dataIndex: "isPinned",
          render: (value) => (value ? "YES" : "NO"),
        },
        {
          title: "Active",
          dataIndex: "isActive",
          render: (value) => (
            <span className={getStatusBadgeClass(value ? "ACTIVE" : "BLOCKED")}>
              {value ? "ACTIVE" : "INACTIVE"}
            </span>
          ),
        },
        {
          title: "Expiry",
          key: "expiry",
          render: (_, record) => {
            const t = upper(record?.expiryType);
            if (t === "EXPIRE_AFTER_DATE") return formatDate(record?.expiryDate);
            return t || "-";
          },
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditAnnouncement(record)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteAnnouncement(record?._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "approvalsPetStores") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Email",
          dataIndex: "email",
          sorter: (a, b) => (a?.email || "").length - (b?.email || "").length,
        },
        {
          title: "Phone",
          dataIndex: "phone",
          sorter: (a, b) => (a?.phone || "").length - (b?.phone || "").length,
        },
        {
          title: "Role",
          dataIndex: "role",
          sorter: (a, b) => (a?.role || "").length - (b?.role || "").length,
        },
        {
          title: "Status",
          dataIndex: "status",
          sorter: (a, b) => (a?.status || "").length - (b?.status || "").length,
          render: (value) => (
            <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={() => handleApprovePetStore(record?._id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRejectPetStore(record?._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "pets") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Species",
          dataIndex: "species",
          sorter: (a, b) => (a?.species || "").length - (b?.species || "").length,
        },
        {
          title: "Breed",
          dataIndex: "breed",
          sorter: (a, b) => (a?.breed || "").length - (b?.breed || "").length,
        },
        {
          title: "Owner",
          key: "owner",
          render: (_, record) => record?.ownerId?.name || "",
        },
        {
          title: "Active",
          dataIndex: "isActive",
          render: (value) => (
            <span className={getStatusBadgeClass(value ? "ACTIVE" : "BLOCKED")}>
              {value ? "ACTIVE" : "INACTIVE"}
            </span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
      ];
    }

    if (entity === "medicalRecords") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "Title",
          dataIndex: "title",
          sorter: (a, b) => (a?.title || "").length - (b?.title || "").length,
        },
        {
          title: "Type",
          dataIndex: "recordType",
          sorter: (a, b) => (a?.recordType || "").length - (b?.recordType || "").length,
        },
        {
          title: "Pet",
          key: "pet",
          render: (_, record) => record?.petId?.name || "",
        },
        {
          title: "Owner",
          key: "owner",
          render: (_, record) => record?.petOwnerId?.name || "",
        },
        {
          title: "Uploaded",
          dataIndex: "uploadedDate",
          render: (value) => formatDate(value),
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteMedicalRecord(record?._id)}
              >
                Delete
              </button>
            </div>
          ),
        },
      ];
    }

    if (entity === "vaccines") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Species",
          dataIndex: "applicableSpecies",
          render: (value) => (Array.isArray(value) ? value.join(", ") : ""),
        },
        {
          title: "Active",
          dataIndex: "isActive",
          render: (value) => (
            <span className={getStatusBadgeClass(value ? "ACTIVE" : "BLOCKED")}>
              {value ? "ACTIVE" : "INACTIVE"}
            </span>
          ),
        },
        {
          title: "Min Age (weeks)",
          dataIndex: "minAgeWeeks",
        },
        {
          title: "Doses",
          dataIndex: "dosesRequired",
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => openEditVaccine(record)}
              >
                Edit
              </button>
            </div>
          ),
        },
      ];
    }

    if (entity === "appointments") {
      columns = [
        {
          title: "Number",
          dataIndex: "appointmentNumber",
          sorter: (a, b) => (a?.appointmentNumber || "").length - (b?.appointmentNumber || "").length,
        },
        {
          title: "Date",
          dataIndex: "appointmentDate",
          render: (value) => formatDate(value),
        },
        {
          title: "Time",
          dataIndex: "appointmentTime",
        },
        {
          title: "Type",
          dataIndex: "bookingType",
          render: (value) => upper(value) || "-",
        },
        {
          title: "Veterinarian",
          key: "veterinarian",
          render: (_, record) => record?.veterinarianId?.name || "",
        },
        {
          title: "Pet Owner",
          key: "petOwner",
          render: (_, record) => record?.petOwnerId?.name || "",
        },
        {
          title: "Pet",
          key: "pet",
          render: (_, record) => record?.petId?.name || "",
        },
        {
          title: "Status",
          dataIndex: "status",
          render: (value) => (
            <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>
          ),
        },
        {
          title: "Payment",
          dataIndex: "paymentStatus",
          render: (value) => upper(value) || "-",
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => openAppointmentDetails(record)}
              >
                View Details
              </button>
            </div>
          ),
        },
      ];
    }

    if (entity === "reviews") {
      columns = [
        {
          title: "Veterinarian",
          key: "veterinarian",
          render: (_, record) => record?.veterinarianId?.name || "",
        },
        {
          title: "Pet Owner",
          key: "petOwner",
          render: (_, record) => record?.petOwnerId?.name || "",
        },
        {
          title: "Pet",
          key: "pet",
          render: (_, record) => record?.petId?.name || "",
        },
        {
          title: "Rating",
          dataIndex: "rating",
        },
        {
          title: "Type",
          dataIndex: "reviewType",
          render: (value) => upper(value) || "-",
        },
        {
          title: "Review",
          dataIndex: "reviewText",
          render: (value) => (value ? String(value) : ""),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          render: (value) => formatDate(value),
        },
      ];
    }

    if (entity === "veterinarians" || entity === "approvalsVets") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Email",
          dataIndex: "email",
          sorter: (a, b) => (a?.email || "").length - (b?.email || "").length,
        },
        {
          title: "Phone",
          dataIndex: "phone",
          sorter: (a, b) => (a?.phone || "").length - (b?.phone || "").length,
        },
        {
          title: "Status",
          dataIndex: "status",
          sorter: (a, b) => (a?.status || "").length - (b?.status || "").length,
          render: (value) => (
            <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>
          ),
        },
        {
          title: "Subscription",
          key: "subscription",
          render: (_, record) => {
            const s =
              record?.subscriptionStatus ||
              record?.subscription?.status ||
              record?.veterinarianProfile?.subscriptionStatus ||
              "";
            return s ? upper(s) : "-";
          },
        },
        {
          title: "Specializations",
          dataIndex: ["veterinarianProfile", "specializations"],
          render: (_, record) => {
            const list = record?.veterinarianProfile?.specializations;
            return Array.isArray(list) ? list.join(", ") : "";
          },
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              {entity === "approvalsVets" ? (
                <div className="d-inline-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={() => handleApproveVet(record?._id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRejectVet(record?._id)}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteUser(record?._id)}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="d-inline-flex gap-2">
                  {upper(record?.status) === "BLOCKED" ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-warning"
                      onClick={() => handleUpdateUserStatus(record?._id, "APPROVED")}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleUpdateUserStatus(record?._id, "BLOCKED")}
                    >
                      Block
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteUser(record?._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ),
        },
      ];
    }

    if (entity === "transactions") {
      columns = [
        {
          title: "Transaction",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Status",
          dataIndex: "status",
          sorter: (a, b) => (a?.status || "").length - (b?.status || "").length,
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
      ];
    }

    if (entity === "petStores") {
      columns = [
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Kind",
          key: "kind",
          render: (_, record) => upper(record?.kind) || "-",
        },
        {
          title: "Owner",
          key: "owner",
          render: (_, record) => record?.ownerId?.fullName || record?.ownerId?.name || record?.ownerId?.email || "",
        },
        {
          title: "City",
          key: "city",
          render: (_, record) => record?.address?.city || "",
        },
        {
          title: "Active",
          dataIndex: "isActive",
          render: (value) => (
            <span className={getStatusBadgeClass(value ? "ACTIVE" : "BLOCKED")}>{value ? "ACTIVE" : "INACTIVE"}</span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button type="button" className="btn btn-sm btn-primary" onClick={() => openEditPetStore(record)}>
                  Edit
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeletePetStore(record?._id)}>
                  Delete
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "products") {
      columns = [
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => (a?.name || "").length - (b?.name || "").length,
        },
        {
          title: "Seller",
          key: "seller",
          render: (_, record) => record?.sellerId?.name || record?.sellerId?.email || "",
        },
        {
          title: "Store",
          key: "store",
          render: (_, record) => record?.petStoreId?.name || "-",
        },
        {
          title: "Price",
          dataIndex: "price",
        },
        {
          title: "Stock",
          dataIndex: "stock",
        },
        {
          title: "Active",
          dataIndex: "isActive",
          render: (value) => (
            <span className={getStatusBadgeClass(value ? "ACTIVE" : "BLOCKED")}>{value ? "ACTIVE" : "INACTIVE"}</span>
          ),
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button type="button" className="btn btn-sm btn-primary" onClick={() => openEditProduct(record)}>
                  Edit
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(record?._id)}>
                  Delete
                </button>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "orders") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "Pet Owner",
          key: "petOwner",
          render: (_, record) => record?.petOwnerId?.name || record?.petOwnerId?.email || "",
        },
        {
          title: "Store",
          key: "store",
          render: (_, record) => record?.petStoreId?.name || "",
        },
        {
          title: "Total",
          dataIndex: "total",
        },
        {
          title: "Status",
          dataIndex: "status",
          render: (value) => <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>,
        },
        {
          title: "Payment",
          dataIndex: "paymentStatus",
          render: (value) => upper(value) || "-",
        },
        {
          title: "Created",
          dataIndex: "createdAt",
          sorter: (a, b) => (a?.createdAt || "").length - (b?.createdAt || "").length,
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button type="button" className="btn btn-sm btn-primary" onClick={() => openOrderDetails(record)}>
                  View
                </button>
                <select
                  className="form-select form-select-sm"
                  value={upper(record?.status) || ""}
                  onChange={(e) => handleUpdateOrderStatus(record?._id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "transactions" || entity === "payments") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "User",
          key: "user",
          render: (_, record) => {
            const u = record?.userId;
            if (!u) return "";
            if (typeof u === "string") return String(u).slice(-6);
            return u?.name || u?.email || "";
          },
        },
        {
          title: "Amount",
          key: "amount",
          render: (_, record) => `${record?.amount ?? ""} ${record?.currency || ""}`,
        },
        {
          title: "Provider",
          dataIndex: "provider",
          render: (v) => v || "-",
        },
        {
          title: "Status",
          dataIndex: "status",
          render: (value) => <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>,
        },
        {
          title: "Created",
          dataIndex: "createdAt",
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              <div className="d-inline-flex gap-2">
                <button type="button" className="btn btn-sm btn-primary" onClick={() => openTransactionDetails(record)}>
                  View
                </button>
                <select
                  className="form-select form-select-sm"
                  value={upper(record?.status) || ""}
                  onChange={(e) => handleUpdateTransactionStatus(record?._id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
                {entity === "payments" ? (
                  <button type="button" className="btn btn-sm btn-warning" onClick={() => handleRefundTransaction(record?._id)}>
                    Refund
                  </button>
                ) : null}
              </div>
            </div>
          ),
        },
      ];
    }

    if (entity === "withdrawals") {
      columns = [
        {
          title: "ID",
          dataIndex: "_id",
          render: (value) => (value ? String(value).slice(-6) : ""),
        },
        {
          title: "User",
          key: "user",
          render: (_, record) => record?.userId?.fullName || record?.userId?.name || record?.userId?.email || "",
        },
        {
          title: "Role",
          key: "role",
          render: (_, record) => {
            const r = record?.userId?.role || record?.userRole || record?.role;
            return upper(r) || "-";
          },
        },
        {
          title: "Amount",
          dataIndex: "amount",
        },
        {
          title: "Status",
          dataIndex: "status",
          render: (value) => <span className={getStatusBadgeClass(value)}>{upper(value) || "-"}</span>,
        },
        {
          title: "Created",
          dataIndex: "createdAt",
        },
        {
          title: "",
          dataIndex: "actions",
          render: (_, record) => (
            <div className="text-end">
              {upper(record?.status) === "PENDING" ? (
                <div className="d-inline-flex gap-2">
                  <button type="button" className="btn btn-sm btn-success" onClick={() => openApproveWithdrawal(record)}>
                    Approve
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => openRejectWithdrawal(record)}>
                    Reject
                  </button>
                </div>
              ) : (
                <span />
              )}
            </div>
          ),
        },
      ];
    }

    return {
      title: cfg.title,
      section: cfg.section,
      columns,
      addPath: cfg.addPath,
    };
  }, [entity]);

  useEffect(() => {
    setIsResetting(true);
    setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    setSearch("");
    setStatusFilter("");
    setRoleFilter(entity === "approvalsPetStores" ? "PET_STORE" : "");
    setSubscriptionStatusFilter("");
    setSpeciesFilter("");
    setPetActiveFilter("");
    setRecordTypeFilter("");
    setIncludeInactiveFilter("");
    setAppointmentStatusFilter("");
    setAppointmentPaymentStatusFilter("");
    setAppointmentFromDateFilter("");
    setAppointmentToDateFilter("");
    setReviewVeterinarianIdFilter("");
    setReviewPetOwnerIdFilter("");
    setReviewRatingFilter("");
    setPlanTypeFilter("");
    setPlanStatusFilter("");
    setInsuranceIsActiveFilter("");
    setAnnouncementPriorityFilter("");
    setAnnouncementTypeFilter("");
    setAnnouncementPinnedFilter("");
    setAnnouncementIsActiveFilter("");
    setPetStoreKindFilter("");
    setPetStoreCityFilter("");
    setProductIsActiveFilter("");
    setProductCategoryFilter("");
    setProductSellerTypeFilter("");
    setProductPetTypeFilter("");
    setOrderStatusFilter("");
    setOrderPaymentStatusFilter("");
    setOrderPetStoreIdFilter("");
    setOrderPetOwnerIdFilter("");
    setTransactionStatusFilter("");
    setTransactionProviderFilter("");
    setTransactionTypeFilter("");
    setTransactionFromDateFilter("");
    setTransactionToDateFilter("");
    setWithdrawalStatusFilter("");
    setSelectedRowKeys([]);
    setTimeout(() => setIsResetting(false), 0);
  }, [entity]);

  useEffect(() => {
    if (isResetting) return;
    fetchData();
  }, [
    entity,
    isResetting,
    pagination.page,
    pagination.limit,
    statusFilter,
    roleFilter,
    subscriptionStatusFilter,
    speciesFilter,
    petActiveFilter,
    recordTypeFilter,
    includeInactiveFilter,
    appointmentStatusFilter,
    appointmentPaymentStatusFilter,
    appointmentFromDateFilter,
    appointmentToDateFilter,
    reviewVeterinarianIdFilter,
    reviewPetOwnerIdFilter,
    reviewRatingFilter,
    planTypeFilter,
    planStatusFilter,
    insuranceIsActiveFilter,
    announcementPriorityFilter,
    announcementTypeFilter,
    announcementPinnedFilter,
    announcementIsActiveFilter,
    petStoreKindFilter,
    petStoreCityFilter,
    productIsActiveFilter,
    productCategoryFilter,
    productSellerTypeFilter,
    productPetTypeFilter,
    orderStatusFilter,
    orderPaymentStatusFilter,
    orderPetStoreIdFilter,
    orderPetOwnerIdFilter,
    transactionStatusFilter,
    transactionProviderFilter,
    transactionTypeFilter,
    transactionFromDateFilter,
    transactionToDateFilter,
    withdrawalStatusFilter,
  ]);

  const handleClearFilters = () => {
    setIsResetting(true);
    setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    setSearch("");
    setStatusFilter("");
    setRoleFilter(entity === "approvalsPetStores" ? "PET_STORE" : "");
    setSubscriptionStatusFilter("");
    setSpeciesFilter("");
    setPetActiveFilter("");
    setRecordTypeFilter("");
    setIncludeInactiveFilter("");
    setAppointmentStatusFilter("");
    setAppointmentPaymentStatusFilter("");
    setAppointmentFromDateFilter("");
    setAppointmentToDateFilter("");
    setReviewVeterinarianIdFilter("");
    setReviewPetOwnerIdFilter("");
    setReviewRatingFilter("");
    setPlanTypeFilter("");
    setPlanStatusFilter("");
    setInsuranceIsActiveFilter("");
    setAnnouncementPriorityFilter("");
    setAnnouncementTypeFilter("");
    setAnnouncementPinnedFilter("");
    setAnnouncementIsActiveFilter("");
    setPetStoreKindFilter("");
    setPetStoreCityFilter("");
    setProductIsActiveFilter("");
    setProductCategoryFilter("");
    setProductSellerTypeFilter("");
    setProductPetTypeFilter("");
    setOrderStatusFilter("");
    setOrderPaymentStatusFilter("");
    setOrderPetStoreIdFilter("");
    setOrderPetOwnerIdFilter("");
    setTransactionStatusFilter("");
    setTransactionProviderFilter("");
    setTransactionTypeFilter("");
    setTransactionFromDateFilter("");
    setTransactionToDateFilter("");
    setWithdrawalStatusFilter("");
    setSelectedRowKeys([]);
    setTimeout(() => {
      setIsResetting(false);
      fetchData({ page: 1, limit: 10 });
    }, 0);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const datasource = useMemo(() => {
    return (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      id: item?._id || item?.id,
      createdAt: item?.createdAt ? formatDate(item?.createdAt) : item?.createdAt,
      appointmentDate: item?.appointmentDate ? formatDate(item?.appointmentDate) : item?.appointmentDate,
      uploadedDate: item?.uploadedDate ? formatDate(item?.uploadedDate) : item?.uploadedDate,
    }));
  }, [data]);

  const pageTitle = useMemo(() => {
    if (entity === "approvalsVets") return "Veterinarian Approvals";
    return title;
  }, [entity, title]);

  return (
    <>
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">{section || "Admin"} </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FeatherIcon icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">{title}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>{pageTitle}</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  setPagination((prev) => ({ ...prev, page: 1 }));
                                  fetchData({ page: 1 });
                                }}
                              >
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search here"
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                />
                                <button type="submit" className="btn">
                                  <img src={searchnormal} alt="#" />
                                </button>
                              </form>
                            </div>
                            {entity === "users" || entity === "approvalsPetStores" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={entity === "approvalsPetStores" ? (roleFilter || "PET_STORE") : roleFilter}
                                  onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  {entity === "users" ? (
                                    <>
                                      <option value="">All Roles</option>
                                      <option value="ADMIN">ADMIN</option>
                                      <option value="PET_OWNER">PET_OWNER</option>
                                      <option value="VETERINARIAN">VETERINARIAN</option>
                                      <option value="PET_STORE">PET_STORE</option>
                                      <option value="PARAPHARMACY">PARAPHARMACY</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="PET_STORE">PET_STORE</option>
                                      <option value="PARAPHARMACY">PARAPHARMACY</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            ) : null}

                            {entity === "petStores" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={petStoreKindFilter}
                                  onChange={(e) => {
                                    setPetStoreKindFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All</option>
                                  <option value="PHARMACY">PHARMACY</option>
                                  <option value="PARAPHARMACY">PARAPHARMACY</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "petStores" ? (
                              <div className="ms-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="City"
                                  value={petStoreCityFilter}
                                  onChange={(e) => {
                                    setPetStoreCityFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}

                            {entity === "products" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={productIsActiveFilter}
                                  onChange={(e) => {
                                    setProductIsActiveFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">Active Only</option>
                                  <option value="all">All</option>
                                  <option value="true">Active</option>
                                  <option value="false">Inactive</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "products" ? (
                              <div className="ms-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Category"
                                  value={productCategoryFilter}
                                  onChange={(e) => {
                                    setProductCategoryFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "products" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={productSellerTypeFilter}
                                  onChange={(e) => {
                                    setProductSellerTypeFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Sellers</option>
                                  <option value="PET_STORE">PET_STORE</option>
                                  <option value="PARAPHARMACY">PARAPHARMACY</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "products" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={productPetTypeFilter}
                                  onChange={(e) => {
                                    setProductPetTypeFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Pets</option>
                                  <option value="DOG">DOG</option>
                                  <option value="CAT">CAT</option>
                                  <option value="BIRD">BIRD</option>
                                  <option value="RABBIT">RABBIT</option>
                                  <option value="OTHER">OTHER</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "orders" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={orderStatusFilter}
                                  onChange={(e) => {
                                    setOrderStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Status</option>
                                  <option value="PENDING">PENDING</option>
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "orders" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={orderPaymentStatusFilter}
                                  onChange={(e) => {
                                    setOrderPaymentStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Payments</option>
                                  <option value="UNPAID">UNPAID</option>
                                  <option value="PARTIAL">PARTIAL</option>
                                  <option value="PAID">PAID</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "orders" ? (
                              <div className="ms-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PetStore ID"
                                  value={orderPetStoreIdFilter}
                                  onChange={(e) => {
                                    setOrderPetStoreIdFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "orders" ? (
                              <div className="ms-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PetOwner ID"
                                  value={orderPetOwnerIdFilter}
                                  onChange={(e) => {
                                    setOrderPetOwnerIdFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}

                            {entity === "transactions" || entity === "payments" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={transactionStatusFilter}
                                  onChange={(e) => {
                                    setTransactionStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Status</option>
                                  <option value="PENDING">PENDING</option>
                                  <option value="SUCCESS">SUCCESS</option>
                                  <option value="FAILED">FAILED</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "transactions" ? (
                              <div className="ms-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Provider"
                                  value={transactionProviderFilter}
                                  onChange={(e) => {
                                    setTransactionProviderFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "transactions" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={transactionTypeFilter}
                                  onChange={(e) => {
                                    setTransactionTypeFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Types</option>
                                  <option value="APPOINTMENT">APPOINTMENT</option>
                                  <option value="SUBSCRIPTION">SUBSCRIPTION</option>
                                  <option value="PRODUCT">PRODUCT</option>
                                  <option value="ORDER">ORDER</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "transactions" ? (
                              <div className="ms-2">
                                <input
                                  type="date"
                                  className="form-control"
                                  value={transactionFromDateFilter}
                                  onChange={(e) => {
                                    setTransactionFromDateFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "transactions" ? (
                              <div className="ms-2">
                                <input
                                  type="date"
                                  className="form-control"
                                  value={transactionToDateFilter}
                                  onChange={(e) => {
                                    setTransactionToDateFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}

                            {entity === "withdrawals" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={withdrawalStatusFilter}
                                  onChange={(e) => {
                                    setWithdrawalStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All</option>
                                  <option value="PENDING">PENDING</option>
                                  <option value="APPROVED">APPROVED</option>
                                  <option value="REJECTED">REJECTED</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "subscriptionPlans" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={planTypeFilter}
                                  onChange={(e) => {
                                    setPlanTypeFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Types</option>
                                  <option value="VETERINARIAN">VETERINARIAN</option>
                                  <option value="PET_STORE">PET_STORE</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "subscriptionPlans" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={planStatusFilter}
                                  onChange={(e) => {
                                    setPlanStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Status</option>
                                  <option value="ACTIVE">ACTIVE</option>
                                  <option value="INACTIVE">INACTIVE</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "insuranceCompanies" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={insuranceIsActiveFilter}
                                  onChange={(e) => {
                                    setInsuranceIsActiveFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All</option>
                                  <option value="true">Active</option>
                                  <option value="false">Inactive</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "announcements" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={announcementPriorityFilter}
                                  onChange={(e) => {
                                    setAnnouncementPriorityFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Priority</option>
                                  <option value="NORMAL">NORMAL</option>
                                  <option value="IMPORTANT">IMPORTANT</option>
                                  <option value="URGENT">URGENT</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "announcements" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={announcementTypeFilter}
                                  onChange={(e) => {
                                    setAnnouncementTypeFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Types</option>
                                  <option value="BROADCAST">BROADCAST</option>
                                  <option value="TARGETED">TARGETED</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "announcements" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={announcementPinnedFilter}
                                  onChange={(e) => {
                                    setAnnouncementPinnedFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">Pinned?</option>
                                  <option value="true">Pinned</option>
                                  <option value="false">Not Pinned</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "announcements" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={announcementIsActiveFilter}
                                  onChange={(e) => {
                                    setAnnouncementIsActiveFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All</option>
                                  <option value="true">Active</option>
                                  <option value="false">Inactive</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "appointments" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={appointmentStatusFilter}
                                  onChange={(e) => {
                                    setAppointmentStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Status</option>
                                  <option value="PENDING">PENDING</option>
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="NO_SHOW">NO_SHOW</option>
                                  <option value="REJECTED">REJECTED</option>
                                  <option value="RESCHEDULED">RESCHEDULED</option>
                                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "appointments" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={appointmentPaymentStatusFilter}
                                  onChange={(e) => {
                                    setAppointmentPaymentStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Payments</option>
                                  <option value="UNPAID">UNPAID</option>
                                  <option value="PAID">PAID</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "appointments" ? (
                              <div className="ms-2">
                                <input
                                  type="date"
                                  className="form-control"
                                  value={appointmentFromDateFilter}
                                  onChange={(e) => {
                                    setAppointmentFromDateFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "appointments" ? (
                              <div className="ms-2">
                                <input
                                  type="date"
                                  className="form-control"
                                  value={appointmentToDateFilter}
                                  onChange={(e) => {
                                    setAppointmentToDateFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "reviews" ? (
                              <div className="ms-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Veterinarian ID"
                                  value={reviewVeterinarianIdFilter}
                                  onChange={(e) => {
                                    setReviewVeterinarianIdFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "reviews" ? (
                              <div className="ms-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Pet Owner ID"
                                  value={reviewPetOwnerIdFilter}
                                  onChange={(e) => {
                                    setReviewPetOwnerIdFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                />
                              </div>
                            ) : null}
                            {entity === "reviews" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={reviewRatingFilter}
                                  onChange={(e) => {
                                    setReviewRatingFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Ratings</option>
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                  <option value="5">5</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "pets" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={speciesFilter}
                                  onChange={(e) => {
                                    setSpeciesFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Species</option>
                                  <option value="DOG">DOG</option>
                                  <option value="CAT">CAT</option>
                                  <option value="BIRD">BIRD</option>
                                  <option value="RABBIT">RABBIT</option>
                                  <option value="OTHER">OTHER</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "pets" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={petActiveFilter}
                                  onChange={(e) => {
                                    setPetActiveFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All</option>
                                  <option value="true">Active</option>
                                  <option value="false">Inactive</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "medicalRecords" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={recordTypeFilter}
                                  onChange={(e) => {
                                    setRecordTypeFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Types</option>
                                  <option value="LAB_REPORT">LAB_REPORT</option>
                                  <option value="PRESCRIPTION">PRESCRIPTION</option>
                                  <option value="XRAY">XRAY</option>
                                  <option value="VACCINATION">VACCINATION</option>
                                  <option value="OTHER">OTHER</option>
                                </select>
                              </div>
                            ) : null}

                            {entity === "vaccines" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={includeInactiveFilter}
                                  onChange={(e) => {
                                    setIncludeInactiveFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">Active Only</option>
                                  <option value="true">Include Inactive</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "users" || entity === "veterinarians" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={statusFilter}
                                  onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Status</option>
                                  <option value="PENDING">PENDING</option>
                                  <option value="APPROVED">APPROVED</option>
                                  <option value="REJECTED">REJECTED</option>
                                  <option value="BLOCKED">BLOCKED</option>
                                </select>
                              </div>
                            ) : null}
                            {entity === "veterinarians" ? (
                              <div className="ms-2">
                                <select
                                  className="form-select"
                                  value={subscriptionStatusFilter}
                                  onChange={(e) => {
                                    setSubscriptionStatusFilter(e.target.value);
                                    setPagination((prev) => ({ ...prev, page: 1 }));
                                  }}
                                >
                                  <option value="">All Subscriptions</option>
                                  <option value="ACTIVE">ACTIVE</option>
                                  <option value="EXPIRED">EXPIRED</option>
                                  <option value="NONE">NONE</option>
                                </select>
                              </div>
                            ) : null}
                            <div className="add-group">
                              {entity === "vaccines" ? (
                                <button
                                  type="button"
                                  className="btn btn-primary add-pluss ms-2"
                                  title="Add Vaccine"
                                  onClick={openAddVaccine}
                                >
                                  <img src={plusicon} alt="#" />
                                </button>
                              ) : null}
                              {entity === "petStores" ? (
                                <button
                                  type="button"
                                  className="btn btn-primary add-pluss ms-2"
                                  title="Add Pet Store"
                                  onClick={openAddPetStore}
                                >
                                  <img src={plusicon} alt="#" />
                                </button>
                              ) : null}
                              {entity === "products" ? (
                                <button
                                  type="button"
                                  className="btn btn-primary add-pluss ms-2"
                                  title="Add Product"
                                  onClick={openAddProduct}
                                >
                                  <img src={plusicon} alt="#" />
                                </button>
                              ) : null}
                              {entity === "specializations" ? (
                                <button
                                  type="button"
                                  className="btn btn-primary add-pluss ms-2"
                                  title="Add Specialization"
                                  onClick={openAddSpecialization}
                                >
                                  <img src={plusicon} alt="#" />
                                </button>
                              ) : null}
                              {entity === "insuranceCompanies" ? (
                                <button
                                  type="button"
                                  className="btn btn-primary add-pluss ms-2"
                                  title="Add Insurance"
                                  onClick={openAddInsurance}
                                >
                                  <img src={plusicon} alt="#" />
                                </button>
                              ) : null}
                              {entity === "announcements" ? (
                                <button
                                  type="button"
                                  className="btn btn-primary add-pluss ms-2"
                                  title="Add Announcement"
                                  onClick={openAddAnnouncement}
                                >
                                  <img src={plusicon} alt="#" />
                                </button>
                              ) : null}
                              {addPath ? (
                                <Link
                                  to={addPath}
                                  className="btn btn-primary add-pluss ms-2"
                                >
                                  <img src={plusicon} alt="#" />
                                </Link>
                              ) : null}
                              {(entity === "users" || entity === "veterinarians" || entity === "approvalsVets" || entity === "approvalsPetStores" || entity === "pets" || entity === "medicalRecords" || entity === "vaccines" || entity === "appointments" || entity === "reviews" || entity === "subscriptionPlans" || entity === "specializations" || entity === "insuranceCompanies" || entity === "announcements" || entity === "petStores" || entity === "products" || entity === "orders" || entity === "transactions" || entity === "payments" || entity === "withdrawals") ? (
                                <button
                                  type="button"
                                  className="btn btn-secondary ms-2"
                                  onClick={handleClearFilters}
                                  disabled={loading}
                                >
                                  Clear
                                </button>
                              ) : null}
                              <Link
                                to="#"
                                className="btn btn-primary doctor-refresh ms-2"
                                onClick={(e) => {
                                  e.preventDefault();
                                  fetchData();
                                }}
                              >
                                <img src={refreshicon} alt="#" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto text-end float-end ms-auto download-grp" />
                    </div>
                  </div>

                  <div className="table-responsive doctor-list">
                    {error ? (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    ) : null}
                    <Table
                      loading={loading}
                      pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        showTotal: (total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                        onShowSizeChange: onShowSizeChange,
                        itemRender: itemRender,
                        onChange: (page, pageSize) => {
                          setPagination((prev) => ({
                            ...prev,
                            page,
                            limit: pageSize || prev.limit,
                          }));
                        },
                      }}
                      columns={columns}
                      dataSource={datasource}
                      rowSelection={rowSelection}
                      rowKey={(record) => record?.id || record?._id}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={productModalOpen}
        title={productEditing?._id ? "Edit Product" : "Add Product"}
        onCancel={() => {
          setProductModalOpen(false);
          setProductEditing(null);
        }}
        onOk={handleSaveProduct}
        okText={productEditing?._id ? "Save" : "Create"}
        confirmLoading={productSaving}
        destroyOnClose
      >
        <Form
          form={productForm}
          layout="vertical"
          initialValues={{
            name: "",
            description: "",
            sku: "",
            price: 0,
            discountPrice: null,
            stock: 0,
            category: "",
            subCategory: "",
            petType: [],
            tags: "",
            requiresPrescription: false,
            isActive: true,
            images: [],
          }}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="SKU" name="sku">
            <Input />
          </Form.Item>

          <Form.Item label="Price" name="price" rules={[{ required: true, message: "Price is required" }]}>
            <InputNumber min={0} className="w-100" />
          </Form.Item>

          <Form.Item label="Discount Price" name="discountPrice">
            <InputNumber min={0} className="w-100" />
          </Form.Item>

          <Form.Item label="Stock" name="stock">
            <InputNumber min={0} className="w-100" />
          </Form.Item>

          <Form.Item label="Category" name="category">
            <Input />
          </Form.Item>

          <Form.Item label="Sub Category" name="subCategory">
            <Input />
          </Form.Item>

          <Form.Item label="Pet Types" name="petType">
            <Select
              mode="multiple"
              options={[
                { value: "DOG", label: "DOG" },
                { value: "CAT", label: "CAT" },
                { value: "BIRD", label: "BIRD" },
                { value: "RABBIT", label: "RABBIT" },
                { value: "OTHER", label: "OTHER" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Tags (comma separated)" name="tags">
            <Input />
          </Form.Item>

          <Form.Item label="Requires Prescription" name="requiresPrescription" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Images" name="images">
            <Input.TextArea rows={2} readOnly value={(productForm.getFieldValue("images") || []).join("\n")} />
          </Form.Item>

          <div className="d-flex align-items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              ref={productImagesPickerRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handlePickAndUploadMultiple({
                  files,
                  endpoint: "/upload/product",
                  form: productForm,
                  field: "images",
                  fieldName: "product",
                });
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => productImagesPickerRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Pick & Upload"}
            </button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={petStoreModalOpen}
        title={petStoreEditing?._id ? "Edit Pet Store" : "Add Pet Store"}
        onCancel={() => {
          setPetStoreModalOpen(false);
          setPetStoreEditing(null);
        }}
        onOk={handleSavePetStore}
        okText={petStoreEditing?._id ? "Save" : "Create"}
        confirmLoading={petStoreSaving}
        destroyOnClose
      >
        <Form
          form={petStoreForm}
          layout="vertical"
          initialValues={{
            ownerId: "",
            name: "",
            logo: "",
            phone: "",
            addressLine1: "",
            addressCity: "",
            addressState: "",
            addressCountry: "",
            addressZip: "",
            isActive: true,
          }}
        >
          <Form.Item label="Owner ID" name="ownerId" rules={[{ required: !petStoreEditing?._id, message: "Owner ID is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Logo" name="logo">
            <Input readOnly />
          </Form.Item>

          <div className="d-flex align-items-center gap-2 mb-3">
            <input
              type="file"
              accept="image/*"
              ref={petStoreLogoPickerRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                handlePickAndUpload({
                  file,
                  endpoint: "/upload/pet-store",
                  form: petStoreForm,
                  field: "logo",
                });
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => petStoreLogoPickerRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Pick & Upload Logo"}
            </button>
          </div>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Address Line 1" name="addressLine1">
            <Input />
          </Form.Item>
          <Form.Item label="City" name="addressCity">
            <Input />
          </Form.Item>
          <Form.Item label="State" name="addressState">
            <Input />
          </Form.Item>
          <Form.Item label="Country" name="addressCountry">
            <Input />
          </Form.Item>
          <Form.Item label="Zip" name="addressZip">
            <Input />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={orderDetailsOpen}
        title="Order Details"
        onCancel={() => {
          setOrderDetailsOpen(false);
          setOrderDetails(null);
        }}
        footer={null}
        destroyOnClose
      >
        {orderDetailsLoading ? (
          <div>Loading...</div>
        ) : orderDetails ? (
          <div>
            <div className="mb-2"><strong>ID:</strong> {orderDetails?._id}</div>
            <div className="mb-2"><strong>Order #:</strong> {orderDetails?.orderNumber || "-"}</div>
            <div className="mb-2"><strong>Status:</strong> {upper(orderDetails?.status) || "-"}</div>
            <div className="mb-2"><strong>Payment:</strong> {upper(orderDetails?.paymentStatus) || "-"}</div>
            <div className="mb-2"><strong>Total:</strong> {orderDetails?.total}</div>
            <div className="mb-2"><strong>Created:</strong> {formatDate(orderDetails?.createdAt)}</div>
            <div className="mb-2"><strong>Items:</strong></div>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(orderDetails?.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td>{it?.productId?.name || it?.productId || ""}</td>
                      <td>{it?.quantity}</td>
                      <td>{it?.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>No details</div>
        )}
      </Modal>

      <Modal
        open={transactionDetailsOpen}
        title="Transaction Details"
        onCancel={() => {
          setTransactionDetailsOpen(false);
          setTransactionDetails(null);
        }}
        footer={null}
        destroyOnClose
      >
        {transactionDetailsLoading ? (
          <div>Loading...</div>
        ) : transactionDetails ? (
          <div>
            <div className="mb-2"><strong>ID:</strong> {transactionDetails?._id}</div>
            <div className="mb-2"><strong>User:</strong> {transactionDetails?.userId?.fullName || transactionDetails?.userId?.name || transactionDetails?.userId?.email || ""}</div>
            <div className="mb-2"><strong>Amount:</strong> {transactionDetails?.amount} {transactionDetails?.currency}</div>
            <div className="mb-2"><strong>Status:</strong> {upper(transactionDetails?.status) || "-"}</div>
            <div className="mb-2"><strong>Provider:</strong> {transactionDetails?.provider || "-"}</div>
            <div className="mb-2"><strong>Ref:</strong> {transactionDetails?.providerReference || "-"}</div>
            <div className="mb-2"><strong>Created:</strong> {formatDate(transactionDetails?.createdAt)}</div>
          </div>
        ) : (
          <div>No details</div>
        )}
      </Modal>

      <Modal
        open={withdrawalApproveOpen}
        title="Approve Withdrawal"
        onCancel={() => {
          setWithdrawalApproveOpen(false);
          setWithdrawalActing(null);
        }}
        onOk={handleApproveWithdrawal}
        okText="Approve"
        confirmLoading={withdrawalActingLoading}
        destroyOnClose
      >
        <div className="mb-2"><strong>Request ID:</strong> {withdrawalActing?._id}</div>
        <div className="mb-2"><strong>Amount:</strong> {withdrawalActing?.amount}</div>
        <div className="mb-2">Withdrawal fee percent (optional)</div>
        <InputNumber
          min={0}
          max={100}
          className="w-100"
          value={withdrawalFeePercent}
          onChange={(v) => setWithdrawalFeePercent(v)}
        />
        <div className="mt-3">
          {(() => {
            const amount = Number(withdrawalActing?.amount || 0);
            const pct = withdrawalFeePercent === null || withdrawalFeePercent === undefined || withdrawalFeePercent === "" ? 0 : Number(withdrawalFeePercent);
            const fee = (amount * pct) / 100;
            const net = amount - fee;
            return (
              <div>
                <div className="mb-1"><strong>Fee:</strong> {fee.toFixed(2)}</div>
                <div className="mb-1"><strong>Net payout:</strong> {net.toFixed(2)}</div>
              </div>
            );
          })()}
        </div>
      </Modal>

      <Modal
        open={withdrawalRejectOpen}
        title="Reject Withdrawal"
        onCancel={() => {
          setWithdrawalRejectOpen(false);
          setWithdrawalActing(null);
        }}
        onOk={handleRejectWithdrawal}
        okText="Reject"
        confirmLoading={withdrawalActingLoading}
        destroyOnClose
      >
        <div className="mb-2"><strong>Request ID:</strong> {withdrawalActing?._id}</div>
        <div className="mb-2"><strong>Amount:</strong> {withdrawalActing?.amount}</div>
        <Input.TextArea
          rows={3}
          placeholder="Reason"
          value={withdrawalRejectReason}
          onChange={(e) => setWithdrawalRejectReason(e.target.value)}
        />
      </Modal>

      {entity === "vaccines" ? (
        <Modal
          open={vaccineModalOpen}
          title={vaccineEditing?._id ? "Edit Vaccine" : "Add Vaccine"}
          onCancel={() => {
            setVaccineModalOpen(false);
            setVaccineEditing(null);
          }}
          onOk={handleSaveVaccine}
          okText={vaccineEditing?._id ? "Save" : "Create"}
          confirmLoading={vaccineSaving}
          destroyOnClose
        >
          <Form
            form={vaccineForm}
            layout="vertical"
            initialValues={{
              name: "",
              applicableSpecies: [],
              minAgeWeeks: 0,
              dosesRequired: 1,
              isActive: true,
            }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Applicable Species"
              name="applicableSpecies"
              rules={[{ required: true, message: "Select at least one species" }]}
            >
              <Select
                mode="multiple"
                options={[
                  { value: "DOG", label: "DOG" },
                  { value: "CAT", label: "CAT" },
                  { value: "BIRD", label: "BIRD" },
                  { value: "RABBIT", label: "RABBIT" },
                  { value: "OTHER", label: "OTHER" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Min Age (weeks)" name="minAgeWeeks">
              <InputNumber min={0} className="w-100" />
            </Form.Item>

            <Form.Item label="Doses Required" name="dosesRequired">
              <InputNumber min={1} className="w-100" />
            </Form.Item>

            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}

      {entity === "subscriptionPlans" ? (
        <Modal
          open={planModalOpen}
          title={planEditing?._id ? "Edit Plan Price" : "Edit Plan"}
          onCancel={() => {
            setPlanModalOpen(false);
            setPlanEditing(null);
          }}
          onOk={handleSavePlan}
          okText="Save"
          confirmLoading={planSaving}
          destroyOnClose
        >
          <Form
            form={planForm}
            layout="vertical"
            initialValues={{ price: 0 }}
          >
            <Form.Item label="Plan" >
              <Input value={planEditing?.name || ""} disabled />
            </Form.Item>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Price is required" }]}
            >
              <InputNumber min={0} className="w-100" />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}

      {entity === "specializations" ? (
        <Modal
          open={specializationModalOpen}
          title={specializationEditing?._id ? "Edit Specialization" : "Add Specialization"}
          onCancel={() => {
            setSpecializationModalOpen(false);
            setSpecializationEditing(null);
          }}
          onOk={handleSaveSpecialization}
          okText={specializationEditing?._id ? "Save" : "Create"}
          confirmLoading={specializationSaving}
          destroyOnClose
        >
          <Form
            form={specializationForm}
            layout="vertical"
            initialValues={{ name: "", slug: "", description: "", icon: "", type: "" }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Slug" name="slug">
              <Input />
            </Form.Item>
            <Form.Item label="Type" name="type">
              <Input />
            </Form.Item>
            <Form.Item label="Icon" name="icon">
              <div className="d-flex gap-2">
                <Input />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={uploading}
                  onClick={() => specializationIconPickerRef.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={specializationIconPickerRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    await handlePickAndUpload({
                      file,
                      endpoint: "/upload/general",
                      form: specializationForm,
                      field: "icon",
                    });
                  }}
                />
              </div>
              {specializationForm.getFieldValue("icon") ? (
                <div className="mt-2">
                  <a
                    href={toPublicUrl(specializationForm.getFieldValue("icon"))}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                </div>
              ) : null}
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}

      {entity === "insuranceCompanies" ? (
        <Modal
          open={insuranceModalOpen}
          title={insuranceEditing?._id ? "Edit Insurance Company" : "Add Insurance Company"}
          onCancel={() => {
            setInsuranceModalOpen(false);
            setInsuranceEditing(null);
          }}
          onOk={handleSaveInsurance}
          okText={insuranceEditing?._id ? "Save" : "Create"}
          confirmLoading={insuranceSaving}
          destroyOnClose
        >
          <Form
            form={insuranceForm}
            layout="vertical"
            initialValues={{ name: "", logo: "", isActive: true }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Logo" name="logo">
              <div className="d-flex gap-2">
                <Input />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={uploading}
                  onClick={() => insuranceLogoPickerRef.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={insuranceLogoPickerRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    await handlePickAndUpload({
                      file,
                      endpoint: "/upload/general",
                      form: insuranceForm,
                      field: "logo",
                    });
                  }}
                />
              </div>
              {insuranceForm.getFieldValue("logo") ? (
                <div className="mt-2">
                  <a
                    href={toPublicUrl(insuranceForm.getFieldValue("logo"))}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                </div>
              ) : null}
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}

      {entity === "announcements" ? (
        <Modal
          open={announcementModalOpen}
          title={announcementEditing?._id ? "Edit Announcement" : "Add Announcement"}
          onCancel={() => {
            setAnnouncementModalOpen(false);
            setAnnouncementEditing(null);
          }}
          onOk={handleSaveAnnouncement}
          okText={announcementEditing?._id ? "Save" : "Create"}
          confirmLoading={announcementSaving}
          destroyOnClose
        >
          <Form
            form={announcementForm}
            layout="vertical"
            initialValues={{
              title: "",
              message: "",
              link: "",
              image: "",
              file: "",
              priority: "NORMAL",
              announcementType: "BROADCAST",
              isPinned: false,
              isActive: true,
              expiryType: "NO_EXPIRY",
              expiryDate: "",
              specializationIds: [],
              subscriptionPlanIds: [],
              locationCity: "",
              locationState: "",
              locationCountry: "",
              individualVeterinarianIds: "",
            }}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: "Message is required" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Link" name="link">
              <Input />
            </Form.Item>

            <Form.Item label="Image" name="image">
              <div className="d-flex gap-2">
                <Input />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={uploading}
                  onClick={() => announcementImagePickerRef.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={announcementImagePickerRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    await handlePickAndUpload({
                      file,
                      endpoint: "/upload/general",
                      form: announcementForm,
                      field: "image",
                    });
                  }}
                />
              </div>
              {announcementForm.getFieldValue("image") ? (
                <div className="mt-2">
                  <a
                    href={toPublicUrl(announcementForm.getFieldValue("image"))}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                </div>
              ) : null}
            </Form.Item>

            <Form.Item label="File" name="file">
              <div className="d-flex gap-2">
                <Input />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={uploading}
                  onClick={() => announcementFilePickerRef.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={announcementFilePickerRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    await handlePickAndUpload({
                      file,
                      endpoint: "/upload/chat",
                      form: announcementForm,
                      field: "file",
                    });
                  }}
                />
              </div>
              {announcementForm.getFieldValue("file") ? (
                <div className="mt-2">
                  <a
                    href={toPublicUrl(announcementForm.getFieldValue("file"))}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                </div>
              ) : null}
            </Form.Item>

            <Form.Item label="Priority" name="priority">
              <Select
                options={[
                  { value: "NORMAL", label: "NORMAL" },
                  { value: "IMPORTANT", label: "IMPORTANT" },
                  { value: "URGENT", label: "URGENT" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Announcement Type"
              name="announcementType"
              rules={[{ required: true, message: "Type is required" }]}
            >
              <Select
                options={[
                  { value: "BROADCAST", label: "BROADCAST" },
                  { value: "TARGETED", label: "TARGETED" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Pinned" name="isPinned" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Expiry Type" name="expiryType">
              <Select
                options={[
                  { value: "NO_EXPIRY", label: "NO_EXPIRY" },
                  { value: "EXPIRE_AFTER_DATE", label: "EXPIRE_AFTER_DATE" },
                  { value: "AUTO_HIDE_AFTER_READ", label: "AUTO_HIDE_AFTER_READ" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Expiry Date" name="expiryDate">
              <Input type="date" />
            </Form.Item>

            <Form.Item label="Target Specializations" name="specializationIds">
              <Select
                mode="multiple"
                options={(Array.isArray(specializationOptions) ? specializationOptions : []).map((s) => ({
                  value: s?._id,
                  label: s?.name,
                }))}
              />
            </Form.Item>

            <Form.Item label="Target Subscription Plans" name="subscriptionPlanIds">
              <Select
                mode="multiple"
                options={(Array.isArray(subscriptionPlanOptions) ? subscriptionPlanOptions : []).map((p) => ({
                  value: p?._id,
                  label: p?.name,
                }))}
              />
            </Form.Item>

            <Form.Item label="Target Location City" name="locationCity">
              <Input />
            </Form.Item>
            <Form.Item label="Target Location State" name="locationState">
              <Input />
            </Form.Item>
            <Form.Item label="Target Location Country" name="locationCountry">
              <Input />
            </Form.Item>

            <Form.Item label="Individual Veterinarian IDs (comma separated)" name="individualVeterinarianIds">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}

      {entity === "appointments" ? (
        <Modal
          open={appointmentDetailsOpen}
          title="Appointment Details"
          onCancel={() => {
            setAppointmentDetailsOpen(false);
            setAppointmentDetails(null);
          }}
          footer={null}
          destroyOnClose
        >
          {appointmentDetailsLoading ? (
            <div className="py-3">Loading...</div>
          ) : appointmentDetails ? (
            <div>
              <div className="mb-2">
                <strong>Number:</strong> {appointmentDetails?.appointmentNumber || "-"}
              </div>
              <div className="mb-2">
                <strong>Status:</strong> {upper(appointmentDetails?.status) || "-"}
              </div>
              <div className="mb-2">
                <strong>Payment:</strong> {upper(appointmentDetails?.paymentStatus) || "-"}
              </div>
              <div className="mb-2">
                <strong>Type:</strong> {upper(appointmentDetails?.bookingType) || "-"}
              </div>
              <div className="mb-2">
                <strong>Date:</strong> {formatDate(appointmentDetails?.appointmentDate) || "-"}
              </div>
              <div className="mb-2">
                <strong>Time:</strong> {appointmentDetails?.appointmentTime || "-"}
              </div>
              <div className="mb-2">
                <strong>Duration:</strong> {appointmentDetails?.appointmentDuration || "-"}
              </div>
              <div className="mb-2">
                <strong>Veterinarian:</strong> {appointmentDetails?.veterinarianId?.name || "-"}
              </div>
              <div className="mb-2">
                <strong>Pet Owner:</strong> {appointmentDetails?.petOwnerId?.name || "-"}
              </div>
              <div className="mb-2">
                <strong>Pet:</strong> {appointmentDetails?.petId?.name || "-"}
              </div>
              <div className="mb-2">
                <strong>Reason:</strong> {appointmentDetails?.reason || "-"}
              </div>
              <div className="mb-2">
                <strong>Symptoms:</strong> {appointmentDetails?.petSymptoms || "-"}
              </div>
              <div className="mb-2">
                <strong>Clinic:</strong> {appointmentDetails?.clinicName || "-"}
              </div>
              <div className="mb-2">
                <strong>Notes:</strong> {appointmentDetails?.notes || "-"}
              </div>
              <div className="mb-2">
                <strong>Emergency:</strong> {appointmentDetails?.isEmergency ? "YES" : "NO"}
              </div>
              {appointmentDetails?.isEmergency ? (
                <>
                  <div className="mb-2">
                    <strong>Priority:</strong> {upper(appointmentDetails?.emergencyPriority) || "-"}
                  </div>
                  <div className="mb-2">
                    <strong>Description:</strong> {appointmentDetails?.emergencyDescription || "-"}
                  </div>
                </>
              ) : null}
              <div className="mb-2">
                <strong>Video Call Link:</strong>{" "}
                {appointmentDetails?.videoCallLink ? (
                  <a href={appointmentDetails.videoCallLink} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ) : (
            <div className="py-3">No details available</div>
          )}
        </Modal>
      ) : null}

    </>
  );
};

export default AdminEntityListPage;

AdminEntityListPage.propTypes = {
  entity: PropTypes.string.isRequired,
};
