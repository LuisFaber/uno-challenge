import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import * as api from "../services/api";
import type { Lead, LeadStatus } from "../types/lead";
import type { Contact } from "../types/contact";
import LeadForm, { LEAD_STATUS_OPTIONS } from "../components/LeadForm";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Select, { type SelectOption } from "../components/ui/Select";

const LIMIT = 5;
const ORDER_OPTIONS: SelectOption[] = [
  { value: "createdAt", label: "Ordenar por data" },
  { value: "name", label: "Ordenar por nome" },
];

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "Todos os status" },
  ...LEAD_STATUS_OPTIONS,
];

function statusBadgeClass(status: LeadStatus): string {
  const base = "px-3 py-1 rounded-full text-xs font-medium";
  const map: Record<LeadStatus, string> = {
    novo: "bg-gray-100 text-gray-600",
    contactado: "bg-blue-100 text-blue-700",
    qualificado: "bg-yellow-100 text-yellow-700",
    convertido: "bg-green-100 text-green-700",
    perdido: "bg-red-100 text-red-700",
  };
  return `${base} ${map[status] ?? "bg-gray-100 text-gray-600"}`;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SelectOption>(STATUS_FILTER_OPTIONS[0]);
  const [orderOption, setOrderOption] = useState<SelectOption>(ORDER_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const contactOptions: SelectOption[] = contacts.map((c) => ({ value: c.id, label: c.name }));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const orderBy = orderOption.value === "name" ? "name" : "createdAt";
      const order = orderBy === "createdAt" ? "desc" : "asc";
      const result = await api.getLeads({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter.value || undefined,
        page,
        limit: LIMIT,
        orderBy,
        order,
      });
      setLeads(result.data);
      setTotalPages(result.pagination.totalPages || 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar leads");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter.value, orderOption.value, page]);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, orderOption]);

  useEffect(() => {
    if (isModalOpen) fetchContacts();
  }, [isModalOpen, fetchContacts]);

  function openCreateModal() {
    setSelectedLead(null);
    setIsModalOpen(true);
  }

  function openEditModal(lead: Lead) {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedLead(null);
    setIsFormDirty(false);
    setShowConfirmLeave(false);
  }

  function handleRequestClose() {
    if (isFormDirty) {
      setShowConfirmLeave(true);
    } else {
      closeModal();
    }
  }

  function confirmLeave() {
    closeModal();
  }

  function openDeleteModal(lead: Lead) {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setLeadToDelete(null);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter(STATUS_FILTER_OPTIONS[0]);
    setPage(1);
  }

  const hasActiveFilters = Boolean(debouncedSearch.trim() || statusFilter.value);

  async function handleSubmit(data: {
    name: string;
    company: string;
    contactId: string;
    status: LeadStatus;
  }) {
    setSubmitLoading(true);
    try {
      if (selectedLead) {
        await api.updateLead(selectedLead.id, {
          name: data.name,
          company: data.company,
          status: data.status,
          contactId: data.contactId,
        });
        toast.success("Lead atualizado com sucesso.");
      } else {
        await api.createLead(data);
        toast.success("Lead criado com sucesso.");
      }
      closeModal();
      await fetchLeads();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha na requisição";
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!leadToDelete) return;
    setSubmitLoading(true);
    try {
      await api.deleteLead(leadToDelete.id);
      toast.success("Lead excluído com sucesso.");
      closeDeleteModal();
      await fetchLeads();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha ao excluir";
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <>
      <div className="bg-mocha-card rounded-3xl shadow-card border border-mocha-border-card overflow-hidden">
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-terracota-dark tracking-tight">Leads</h1>
              <p className="text-sm text-mocha-medium mt-1">Gerencie oportunidades comerciais</p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="bg-orange-burnt hover:bg-orange-burnt-hover text-white rounded-xl px-5 py-2.5 border border-terracota-border shadow-btn-primary transition-all duration-200 hover:shadow-card-hover"
            >
              Adicionar lead
            </button>
          </div>

          <div className="bg-mocha-bg-subtle border border-mocha-border rounded-2xl p-5 flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar por nome ou empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 bg-mocha-card border border-mocha-border-input rounded-xl px-4 py-2.5 flex-1 max-w-xs shadow-input-inner focus:outline-none focus:ring-2 focus:ring-orange-focus focus:border-orange-focus transition box-border"
            />
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Select
              options={ORDER_OPTIONS}
              value={orderOption}
              onChange={setOrderOption}
            />
          </div>

          {loading ? (
            <p className="text-mocha-medium py-10">Carregando...</p>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-mocha-border mt-6">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-green-forest-band">
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">
                        Nome
                      </th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">
                        Empresa
                      </th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">
                        Criado em
                      </th>
                      <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-mocha-border"
                              aria-hidden
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {hasActiveFilters ? (
                              <>
                                <p className="text-lg font-bold text-mocha-medium mt-4">
                                  Nenhum lead corresponde ao filtro
                                </p>
                                <p className="text-sm text-mocha-medium/80 mt-1">
                                  Tente outro termo ou limpe os filtros para ver todos os leads.
                                </p>
                                <button
                                  type="button"
                                  onClick={clearFilters}
                                  className="mt-6 border border-mocha-border-input text-mocha-medium hover:bg-mocha-bg-subtle px-5 py-2.5 rounded-xl text-sm transition-colors"
                                >
                                  Limpar filtros
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-bold text-mocha-medium mt-4">
                                  Nenhum lead encontrado
                                </p>
                                <p className="text-sm text-mocha-medium/80 mt-1">
                                  Crie um novo lead para começar
                                </p>
                                <button
                                  type="button"
                                  onClick={openCreateModal}
                                  className="mt-6 bg-orange-burnt hover:bg-orange-burnt-hover text-white rounded-xl px-5 py-2.5 border border-terracota-border shadow-btn-primary text-sm transition-all hover:shadow-card-hover"
                                >
                                  Adicionar lead
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead, index) => (
                        <tr
                          key={lead.id}
                          className={`border-b border-mocha-cell hover:bg-table-row-hover transition-colors ${
                            index % 2 === 0 ? "bg-table-row-cream" : "bg-table-row-mocha"
                          }`}
                        >
                          <td className="px-6 py-4 text-sm text-mocha-medium border-r border-mocha-cell">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-avatar-bg text-avatar-text flex items-center justify-center text-sm font-bold shrink-0">
                                {lead.name.charAt(0).toUpperCase()}
                              </div>
                              {lead.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-mocha-medium border-r border-mocha-cell">
                            {lead.company}
                          </td>
                          <td className="px-6 py-4 text-sm border-r border-mocha-cell">
                            <span className={statusBadgeClass(lead.status)}>
                              {LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label ?? lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-mocha-medium border-r border-mocha-cell">
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 text-right border-mocha-cell">
                            <Link
                              to={`/contacts?contactId=${encodeURIComponent(lead.contactId)}`}
                              title="Ir para contato"
                                className="text-mocha-icon hover:text-mocha-icon-hover p-1.5 rounded-lg hover:bg-mocha-bg-subtle transition-colors inline-flex items-center justify-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditModal(lead)}
                              title="Editar"
                              className="text-mocha-icon hover:text-mocha-icon-hover p-1.5 rounded-lg hover:bg-mocha-bg-subtle transition-colors inline-flex items-center justify-center ml-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(lead)}
                              title="Excluir"
                              className="text-terracota-soft hover:text-terracota-dark p-1.5 rounded-lg hover:bg-mocha-bg-subtle transition-colors inline-flex items-center justify-center ml-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={handleRequestClose}>
          <h2 className="text-xl font-semibold text-terracota-dark mb-6">
            {selectedLead ? "Editar lead" : "Novo lead"}
          </h2>
          <LeadForm
            initialValues={
              selectedLead
                ? {
                    name: selectedLead.name,
                    company: selectedLead.company,
                    contactId: selectedLead.contactId,
                    status: selectedLead.status,
                  }
                : null
            }
            contactOptions={contactOptions}
            onSubmit={handleSubmit}
            onCancel={handleRequestClose}
            onDirtyChange={setIsFormDirty}
            loading={submitLoading}
          />
        </Modal>
      )}

      {showConfirmLeave && (
        <Modal onClose={() => setShowConfirmLeave(false)}>
          <h2 className="text-xl font-semibold text-terracota-dark mb-4">Sair sem salvar?</h2>
          <p className="text-mocha-medium mb-6 leading-relaxed">
            Tem certeza que deseja sair? Seus dados serão perdidos.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowConfirmLeave(false)}
              className="border border-mocha-border-input text-mocha-medium px-5 py-2.5 rounded-xl hover:bg-mocha-bg-subtle transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmLeave}
              className="bg-orange-burnt hover:bg-orange-burnt-hover text-white px-5 py-2.5 rounded-xl transition-colors"
            >
              Sair
            </button>
          </div>
        </Modal>
      )}

      {isDeleteModalOpen && leadToDelete && (
        <Modal onClose={closeDeleteModal}>
          <h2 className="text-xl font-semibold text-terracota-dark mb-4">Excluir lead</h2>
          <p className="text-mocha-medium leading-relaxed">
            Tem certeza que deseja excluir este lead?
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="border border-mocha-border-input text-mocha-medium px-5 py-2.5 rounded-xl hover:bg-mocha-bg-subtle transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={submitLoading}
              className="bg-danger hover:bg-danger-hover text-white px-5 py-2.5 rounded-xl disabled:opacity-50 transition-colors"
            >
              {submitLoading ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
