import { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { listPricing, createPricing } from "../../api/pricing";
import { listVehicleTypes } from "../../api/vehicleTypes";

export default function PricingPage() {
  const [pricing, setPricing] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    loai_xe_id: "",
    don_gia_gio: "",
    don_gia_ngay: "",
    hieu_luc_tu: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    Promise.all([listPricing().then(setPricing), listVehicleTypes().then(setVehicleTypes)])
      .catch(() => { setPricing([]); setVehicleTypes([]); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createPricing({
        ...formData,
        loai_xe_id: Number(formData.loai_xe_id),
        don_gia_gio: Number(formData.don_gia_gio),
        don_gia_ngay: formData.don_gia_ngay ? Number(formData.don_gia_ngay) : null,
      });
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading level={2}>Quản lý bảng giá</Heading>
        <Button onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} />
          Thêm bảng giá
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
                <th>Loại xe</th>
                <th>Đơn giá/giờ</th>
                <th>Đơn giá/ngày</th>
                <th>Ngày áp dụng</th>
              </tr>
            </thead>
            <tbody>
              {pricing.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                    Chưa có bảng giá nào
                  </td>
                </tr>
              ) : (
                pricing.map((p) => {
                  const vt = vehicleTypes.find((v) => v.id === p.loai_xe_id);
                  return (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{vt?.ten_loai || p.loai_xe_id}</td>
                      <td>{Number(p.don_gia_gio).toLocaleString()}đ</td>
                      <td>{p.don_gia_ngay ? Number(p.don_gia_ngay).toLocaleString() + "đ" : "-"}</td>
                      <td>{p.hieu_luc_tu}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name="plus" />
            </div>
            <Heading level={2}>Thêm bảng giá</Heading>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Loại xe</label>
                <select
                  value={formData.loai_xe_id}
                  onChange={(e) => setFormData({ ...formData, loai_xe_id: e.target.value })}
                  required
                >
                  <option value="">Chọn loại xe</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>{vt.ten_loai}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Đơn giá/giờ (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.don_gia_gio}
                  onChange={(e) => setFormData({ ...formData, don_gia_gio: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Đơn giá/ngày (VNĐ) — tùy chọn</label>
                <input
                  type="number"
                  min="0"
                  value={formData.don_gia_ngay}
                  onChange={(e) => setFormData({ ...formData, don_gia_ngay: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Ngày áp dụng</label>
                <input
                  type="date"
                  value={formData.hieu_luc_tu}
                  onChange={(e) => setFormData({ ...formData, hieu_luc_tu: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit">Thêm</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
