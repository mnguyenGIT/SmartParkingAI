import { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import {
  listVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deactivateVehicleType,
} from "../../api/vehicleTypes";

export default function VehicleTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ ten_loai: "", mo_ta: "" });

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    setLoading(true);
    try {
      setTypes(await listVehicleTypes());
    } catch {
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormData({ ten_loai: "", mo_ta: "" });
    setShowModal(true);
  }

  function openEdit(type) {
    setEditing(type);
    setFormData({ ten_loai: type.ten_loai, mo_ta: type.mo_ta || "" });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateVehicleType(editing.id, formData);
      } else {
        await createVehicleType(formData);
      }
      setShowModal(false);
      await loadTypes();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    }
  }

  async function handleDeactivate(type) {
    if (!confirm(`Vô hiệu hóa loại xe "${type.ten_loai}"?`)) return;
    try {
      await deactivateVehicleType(type.id);
      await loadTypes();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading level={2}>Quản lý loại xe</Heading>
        <Button onClick={openCreate}>
          <Icon name="plus" size={16} />
          Thêm loại xe
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên loại</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {types.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                    Chưa có loại xe nào
                  </td>
                </tr>
              ) : (
                types.map((type) => (
                  <tr key={type.id}>
                    <td>{type.id}</td>
                    <td>{type.ten_loai}</td>
                    <td>{type.mo_ta || ""}</td>
                    <td>
                      <span className={`status-badge ${type.is_active ? "active" : "inactive"}`}>
                        {type.is_active ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" onClick={() => openEdit(type)} ariaLabel="Sửa">
                        <Icon name="edit" size={14} />
                      </Button>
                      {type.is_active && (
                        <Button variant="ghost" onClick={() => handleDeactivate(type)} ariaLabel="Vô hiệu">
                          <Icon name="trash" size={14} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name={editing ? "edit" : "plus"} />
            </div>
            <Heading level={2}>{editing ? "Sửa loại xe" : "Thêm loại xe"}</Heading>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên loại xe</label>
                <input
                  type="text"
                  value={formData.ten_loai}
                  onChange={(e) => setFormData({ ...formData, ten_loai: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <input
                  type="text"
                  value={formData.mo_ta}
                  onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit">{editing ? "Lưu" : "Thêm"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
