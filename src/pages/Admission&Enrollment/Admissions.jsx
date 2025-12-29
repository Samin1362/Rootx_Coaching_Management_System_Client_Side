import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Admissions = () => {
  const axiosSecure = useAxiosSecure();

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admissions");
      return res.data;
    },
  });

  if (isLoading) {
    return <p className="text-center">Loading admissions...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral mb-4">
        Admissions
      </h1>

      <div className="overflow-x-auto bg-base-100 rounded-xl shadow">
        <table className="table table-zebra">
          {/* Head */}
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Batch ID</th>
              <th>Status</th>
              <th>Follow-ups</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {admissions.map((admission, index) => (
              <tr key={index}>
                <td className="font-medium">{admission.name}</td>
                <td>{admission.phone}</td>
                <td>{admission.email || "—"}</td>
                <td>{admission.interestedBatchId || "—"}</td>

                {/* Status Badge */}
                <td>
                  <span
                    className={`badge capitalize
                      ${
                        admission.status === "inquiry"
                          ? "badge-info"
                          : admission.status === "follow-up"
                          ? "badge-warning"
                          : admission.status === "enrolled"
                          ? "badge-success"
                          : "badge-error"
                      }
                    `}
                  >
                    {admission.status}
                  </span>
                </td>

                {/* Follow-up Count */}
                <td>
                  {admission.followUps?.length || 0}
                </td>

                {/* Date */}
                <td>
                  {new Date(admission.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="space-x-1">
                  <button className="btn btn-ghost btn-xs">
                    View
                  </button>
                  <button className="btn btn-ghost btn-xs">
                    Follow-up
                  </button>
                  <button className="btn btn-ghost btn-xs text-error">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer */}
          <tfoot>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Batch ID</th>
              <th>Status</th>
              <th>Follow-ups</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Admissions;
