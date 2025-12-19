import { useQuery } from "@tanstack/react-query";
import React from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Students = () => {
  const axiosSecure = useAxiosSecure();

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  return (
    <div>
      <h1 className="text-red-400 font-bold">This is Students page</h1>
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Guardian Name</th>
              <th>Guardian Phone</th>
              <th>Batch Id</th>
              <th>Status</th>
              <th>Admission Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {students &&
              students.map((student, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src={student.image}
                            alt="Avatar Tailwind CSS Component"
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{student.name}</td>
                  <td>{student.gender}</td>
                  <td>{student.phone}</td>
                  <td>{student.email}</td>
                  <td>{student.address}</td>
                  <td>{student.guardianName}</td>
                  <td>{student.guardianPhone}</td>
                  <td>{student.batchId}</td>
                  <td>{student.status}</td>
                  <td>{student.createdAt}</td>
                  <th>
                    <button className="btn btn-ghost btn-xs">View</button>
                    <button className="btn btn-ghost btn-xs">Edit</button>
                    <button className="btn btn-ghost btn-xs">Delete</button>
                  </th>
                </tr>
              ))}
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Guardian Name</th>
              <th>Guardian Phone</th>
              <th>Batch Id</th>
              <th>Status</th>
              <th>Admission Date</th>
              <th>Action</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Students;
