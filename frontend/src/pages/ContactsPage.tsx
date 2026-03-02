import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import * as api from "../services/api";
import type { Contact } from "../types/contact";
import ContactForm from "../components/ContactForm";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Select, { type SelectOption } from "../components/ui/Select";

const LIMIT = 5;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const ORDER_OPTIONS: SelectOption[] = [
    { value: "createdAt", label: "Ordenar por data" },
    { value: "name", label: "Ordenar por nome" },
  ];
  const [orderOption, setOrderOption] = useState<SelectOption>(ORDER_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getContacts(debouncedSearch || undefined);
      setContacts(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar contatos");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, orderOption]);

  const sorted = [...contacts].sort((a, b) => {
    if (orderOption.value === "name") return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPages = Math.ceil(sorted.length / LIMIT) || 1;
  const displayed = sorted.slice((page - 1) * LIMIT, page * LIMIT);

  function openCreateModal() {
    setSelectedContact(null);
    setIsModalOpen(true);
  }

  function openEditModal(contact: Contact) {
    setSelectedContact(contact);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedContact(null);
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

  function openDeleteModal(contact: Contact) {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setContactToDelete(null);
  }

  async function handleSubmit(data: { name: string; email: string; phone: string }) {
    setSubmitLoading(true);
    try {
      if (selectedContact) {
        await api.updateContact(selectedContact.id, data);
        toast.success("Contato atualizado com sucesso.");
      } else {
        await api.createContact(data);
        toast.success("Contato criado com sucesso.");
      }
      closeModal();
      await fetchContacts();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha na requisição";
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!contactToDelete) return;
    setSubmitLoading(true);
    try {
      await api.deleteContact(contactToDelete.id);
      toast.success("Contato excluído com sucesso.");
      closeDeleteModal();
      await fetchContacts();
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
          {/* Page header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-terracota-dark tracking-tight">Contatos</h1>
              <p className="text-sm text-mocha-medium mt-1">Gerencie seus relacionamentos comerciais</p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="bg-orange-burnt hover:bg-orange-burnt-hover text-white rounded-xl px-5 py-2.5 border border-terracota-border shadow-btn-primary transition-all duration-200 hover:shadow-card-hover"
            >
              Adicionar contato
            </button>
          </div>

          {/* Filters */}
          <div className="bg-mocha-bg-subtle border border-mocha-border rounded-2xl p-5 flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 bg-mocha-card border border-mocha-border-input rounded-xl px-4 py-2.5 flex-1 max-w-xs shadow-input-inner focus:outline-none focus:ring-2 focus:ring-orange-focus focus:border-orange-focus transition box-border"
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
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">Nome</th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">E-mail</th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">Telefone</th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">Criado em</th>
                      <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-cream font-bold border-b-2 border-green-forest-hover">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-mocha-border" aria-hidden>
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            {debouncedSearch.trim() ? (
                              <>
                                <p className="text-lg font-bold text-mocha-medium mt-4">Nenhum contato corresponde ao filtro</p>
                                <p className="text-sm text-mocha-medium/80 mt-1">Tente outro termo de busca ou limpe os filtros para ver todos os contatos.</p>
                                <button
                                  type="button"
                                  onClick={() => setSearch("")}
                                  className="mt-6 border border-mocha-border-input text-mocha-medium hover:bg-mocha-bg-subtle px-5 py-2.5 rounded-xl text-sm transition-colors"
                                >
                                  Limpar filtros
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-bold text-mocha-medium mt-4">Nenhum contato encontrado</p>
                                <p className="text-sm text-mocha-medium/80 mt-1">Adicione seu primeiro contato para começar</p>
                                <button
                                  type="button"
                                  onClick={openCreateModal}
                                  className="mt-6 bg-orange-burnt hover:bg-orange-burnt-hover text-white rounded-xl px-5 py-2.5 border border-terracota-border shadow-btn-primary text-sm transition-all hover:shadow-card-hover"
                                >
                                  Adicionar contato
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayed.map((c, index) => (
                        <tr
                          key={c.id}
                          className={`border-b border-mocha-cell hover:bg-table-row-hover transition-colors ${index % 2 === 0 ? "bg-table-row-cream" : "bg-table-row-mocha"}`}
                        >
                          <td className="px-6 py-4 text-sm text-mocha-medium border-r border-mocha-cell">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-avatar-bg text-avatar-text flex items-center justify-center text-sm font-bold shrink-0">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              {c.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-mocha-medium border-r border-mocha-cell">{c.email}</td>
                          <td className="px-6 py-4 text-sm text-mocha-medium border-r border-mocha-cell">{c.phone}</td>
                          <td className="px-6 py-4 text-sm text-mocha-medium border-r border-mocha-cell">
                            {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 text-right border-mocha-cell">
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              title="Editar"
                              className="text-mocha-icon hover:text-mocha-icon-hover p-1.5 rounded-lg hover:bg-mocha-bg-subtle transition-colors inline-flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(c)}
                              title="Excluir"
                              className="text-terracota-soft hover:text-terracota-dark p-1.5 rounded-lg hover:bg-mocha-bg-subtle transition-colors inline-flex items-center justify-center ml-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
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
            {selectedContact ? "Editar contato" : "Novo contato"}
          </h2>
          <ContactForm
            initialValues={selectedContact}
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

      {isDeleteModalOpen && contactToDelete && (
        <Modal onClose={closeDeleteModal}>
          <h2 className="text-xl font-semibold text-terracota-dark mb-4">Excluir contato</h2>
          <p className="text-mocha-medium leading-relaxed">
            Tem certeza que deseja excluir este contato?
          </p>
          <p className="text-mocha-medium mt-2 mb-6 leading-relaxed text-sm">
            Os leads associados a este contato também serão excluídos.
          </p>
          <div className="flex gap-3 justify-end">
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

