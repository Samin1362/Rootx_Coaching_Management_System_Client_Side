import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const AdmissionFollowUps = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState(null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  // Fetch admissions
  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admissions");
      return res.data;
    },
  });

  // Patch follow-up
  const followUpMutation = useMutation({
    mutationFn: async ({ id, followUpNote, followUpDate }) => {
      return axiosSecure.patch(`/admissions/${id}`, {
        followUpNote,
        followUpDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admissions"]);
      setActiveId(null);
      setNote("");
      setDate("");
    },
  });

  const handleSubmit = (id) => {
    if (!note) return alert("Follow-up note is required");

    followUpMutation.mutate({
      id,
      followUpNote: note,
      followUpDate: date,
    });
  };

  if (isLoading) {
    return <p>Loading follow-ups...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Admission Follow-ups
      </h1>

      <div className="space-y-4">
        {admissions.map((admission) => (
          <div
            key={admission._id}
            className="border rounded-lg p-4 bg-base-100"
          >
            {/* Basic Info */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{admission.name}</p>
                <p className="text-sm text-gray-500">{admission.phone}</p>
                <p className="text-sm">
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {admission.status}
                  </span>
                </p>
                <p className="text-sm">
                  Follow-ups: {admission.followUps?.length || 0}
                </p>
              </div>

              <button
                className="btn btn-sm"
                onClick={() =>
                  setActiveId(
                    activeId === admission._id ? null : admission._id
                  )
                }
              >
                {activeId === admission._id ? "Cancel" : "Add Follow-up"}
              </button>
            </div>

            {/* Follow-up Form */}
            {activeId === admission._id && (
              <div className="mt-4 space-y-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Follow-up note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSubmit(admission._id)}
                  disabled={followUpMutation.isLoading}
                >
                  Save Follow-up
                </button>
              </div>
            )}

            {/* Existing Follow-ups */}
            {admission.followUps?.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-sm mb-1">Previous Follow-ups</p>
                <ul className="text-sm list-disc ml-4">
                  {admission.followUps.map((f, index) => (
                    <li key={index}>
                      {f.note} —{" "}
                      {new Date(f.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionFollowUps;
