import { useContext } from "react";
import { UserContext } from "../../../contexts";
import { Helmet } from "react-helmet-async";
import { Button, Table } from "react-bootstrap";

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
import { Link } from "react-router-dom";

export default function UserNotes() {
  const user = useContext(UserContext);

  const { data: notes } = useSWR(
    user && user.tokens ? [`${API_URL}/v1/notes`, user.tokens, null] : null
  );

  const onDelete = async (id, e) => {
    e.preventDefault();

    try {
      if (confirm("Are you sure to delete this note?")) {
        const res = await fetch(`${API_URL}/v1/notes/${id}`, {
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
        <title>{`My Notes - ${APP_NAME}`}</title>
      </Helmet>

      <h3>My Private Notes</h3>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created At</th>
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
              <td>
                {dayjs(note.createdAt)
                  .tz(dayjs.tz.guess())
                  .format("YYYY-MM-DD HH:mm:ss")}
              </td>
              <td>
                {note?.ttl ? dayjs.unix(note.ttl).fromNow() : "Permanent"}
              </td>
              <td>
                <Link
                  to={
                    note.status === "private"
                      ? `/v/${note.id}`
                      : `/p/${note.id}`
                  }
                >
                  <a className="btn btn-sm btn-primary m-1">View</a>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="m-1"
                  onClick={(e) => onDelete(note.id, e)}
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
