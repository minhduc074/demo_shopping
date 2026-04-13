import { ProfileForm } from "@/components/forms";
import { EmptyState, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/modules/users/service";

export default async function AccountPage() {
  const user = await requireUser();
  const data = await getProfile(user.id);

  if (!data.profile) {
    return <EmptyState title="Không tìm thấy hồ sơ" description="Tài khoản hiện tại không tồn tại trong bảng users." />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Hồ sơ khách hàng" description="Thông tin cập nhật trực tiếp vào bảng users." />
      <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
        <ProfileForm profile={data.profile} />
      </div>
      <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-ambient)]">
        <h2 className="font-display text-2xl font-semibold">Địa chỉ đã lưu</h2>
        <div className="mt-4 space-y-3">
          {data.userAddresses.length ? data.userAddresses.map((address) => (
            <div key={address.id} className="rounded-2xl bg-[var(--surface-low)] p-4 text-sm">
              <p className="font-semibold">{address.fullName} - {address.phone}</p>
              <p className="mt-1 text-[var(--muted)]">{[address.line1, address.line2, address.ward, address.district, address.province].filter(Boolean).join(", ")}</p>
            </div>
          )) : <p className="text-sm text-[var(--muted)]">Chưa có địa chỉ nào được lưu.</p>}
        </div>
      </div>
    </div>
  );
}
