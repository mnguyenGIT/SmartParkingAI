import { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { listZones, createZone, updateZone, deactivateZone } from "../../api/zones";

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({ ten_khu_vuc: "", mo_ta: "" });

  useEffect(() => {
    loadZones();
  }, []);

  async function loadZones() {
    setLoading(true);
    try {
      setZones(await listZones());
    } catch {
      setZones([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingZone(null);
    setFormData({ ten_khu_vuc: "", mo_ta: "" });
    setShowModal(true);
  }

  function openEdit(zone) {
    setEditingZone(zone);
    setFormData({ ten_khu_vuc: zone.ten_khu_vuc, mo_ta: zone.mo_ta || "" });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingZone) {
        await updateZone(editingZone.id, formData);
      } else {
        await createZone(formData);
      }
      setShowModal(false);
      await loadZones();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    }
  }

  async function handleDeactivate(zone) {
    if (!confirm(`Vô hiệu hóa khu vực "${zone.ten_khu_vuc}"?`)) return;
    try {
      await deactivateZone(zone.id);
      await loadZones();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading level={2}>Quản lý khu vực</Heading>
        <Button onClick={openCreate}>
          <Icon name="plus" size={16} />
          Thêm khu vực
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
                <th>Tên khu vực</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                    Chưa có khu vực nào
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone.id}>
                    <td>{zone.id}</td>
                    <td>{zone.ten_khu_vuc}</td>
                    <td>{zone.mo_ta || ""}</td>
                    <td>
                      <span className={`status-badge ${zone.is_active ? "active" : "inactive"}`}>
                        {zone.is_active ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" onClick={() => openEdit(zone)} ariaLabel="Sửa">
                        <Icon name="edit" size={14} />
                      </Button>
                      {zone.is_active && (
                        <Button variant="ghost" onClick={() => handleDeactivate(zone)} ariaLabel="Vô hiệu">
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
              <Icon name={editingZone ? "edit" : "plus"} />
            </div>
            <Heading level={2}>{editingZone ? "Sửa khu vực" : "Thêm khu vực"}</Heading>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên khu vực</label>
                <input
                  type="text"
                  value={formData.ten_khu_vuc}
                  onChange={(e) => setFormData({ ...formData, ten_khu_vuc: e.target.value })}
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
                <Button type="submit">{editingZone ? "Lưu" : "Thêm"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
