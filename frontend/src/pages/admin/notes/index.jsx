import { useContext } from "react";
import { UserContext } from "../../../contexts";
import { Helmet } from "react-helmet-async";
import { Table, Button } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import qs from "query-string";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);

import { API_URL, APP_NAME } from "../../../statics";
import useSWR from "swr";

export default function AdminNotes() {
  const user = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "public";
  const userId = searchParams.get("userId");

  const { data: notes } = useSWR(
    user && user.tokens && view
      ? [
          `${API_URL}/v1/notes`,
          user.tokens,
          qs.stringify({
            view,
            userId: userId || undefined,
          }),
        ]
      : null
  );

  const onDelete = async (user_id, id, e) => {
    e.preventDefault();

    const genUrl = `${API_URL}/v1/notes/${id}?userId=${user_id}`;
    const url = view === "public" ? `${genUrl}&view=public` : `${genUrl}`;

    try {
      if (confirm("Are you sure to delete this note?")) {
        const res = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.tokens}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data);
        } else {
          const data = await res.json();
          console.log(data);
        }
      } else {
        alert("Delete cancelled");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${view.toUpperCase()} Notes - ${APP_NAME}`}</title>
      </Helmet>

      <h3>{`${view.toUpperCase()} Notes`}</h3>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>CreatedAt</th>
            <th>Expired</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {notes?.data?.map((note) => (
            <tr key={note.id}>
              <td>{note.id}</td>
              <td>{note.title}</td>
              <td>{note.status}</td>
              <td>{dayjs(note.createdAt).format("DD/MM/YYYY HH:mm:ss")}</td>
              <td>
                {note?.ttl ? dayjs.unix(note.ttl).fromNow() : "Permanent"}
              </td>
              <td>
                <Link
                  target="_blank"
                  to={
                    note.status === "private"
                      ? `/v/${note.id}?userId=${note?.userId}`
                      : `/p/${note.id}`
                  }
                >
                  <a className="btn btn-sm btn-primary m-1">View</a>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="m-1"
                  onClick={(e) => onDelete(note.userId, note.id, e)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
