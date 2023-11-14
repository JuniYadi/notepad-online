import { useEffect, useState } from "react";

import Form from "react-bootstrap/esm/Form";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";
import useSWR from "swr";

import { API_URL } from "../../statics";

export default function NotesForm({ action, id }) {
  const [notes, setNotes] = useState({
    title: "",
    content: "",
    ttl: "",
  });

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();

    setLoading(true);

    const reqs = await axios.post(API_URL + "/notes", notes, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (reqs.status === 200) {
      setNotes({
        title: "",
        content: "",
        ttl: "",
      });

      setLoading(false);

      // get id from response
      const id = reqs?.data?.data?.id;

      // redirect to view page
      window.location.href = `/${id}`;
    } else {
      alert("Failed");
    }
  };

  const { data } = useSWR(!isEdit ? `${API_URL}/notes/${id}` : null);

  useEffect(() => {
    if (action === "show" && data) {
      setReadOnly(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <Form>
        <Form.Group className="mb-3" controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="My Random Notes"
            value={data?.title}
            disabled={readOnly}
            onChange={(e) => setNotes({ ...notes, title: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="content">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            disabled={readOnly}
            value={data?.content}
            onChange={(e) => setNotes({ ...notes, content: e.target.value })}
          />
        </Form.Group>

        {action === "insert" && (
          <Form.Group className="mb-3" controlId="expired">
            <Form.Label>Expired</Form.Label>
            <Form.Select
              aria-label="Select Expired"
              disabled={readOnly}
              onChange={(e) =>
                setNotes({
                  ...notes,
                  ttl: e.target.value,
                })
              }
            >
              <option value="5" selected={data?.ttl === 5}>
                5 Minutes
              </option>
              <option value="15" selected={data?.ttl === 15}>
                15 Minutes
              </option>
              <option value="30" selected={data?.ttl === 30}>
                30 Minutes
              </option>
              <option value="60" selected={data?.ttl === 60}>
                1 Hour
              </option>
              <option value="1440" selected={data?.ttl === 1440}>
                1 Day
              </option>
              <option value="10080" selected={data?.ttl === 10080}>
                1 Week
              </option>
              <option value="43200" selected={data?.ttl === 43200}>
                1 Month
              </option>
              <option value="0" selected={!data?.ttl}>
                Permanent
              </option>
            </Form.Select>
          </Form.Group>
        )}

        {!readOnly && !isEdit && (
          <Button
            variant="primary"
            type="submit"
            disabled={readOnly}
            onClick={submitForm}
          >
            Save {loading && "..."}
          </Button>
        )}

        {readOnly && data?.status !== "public" && (
          <Button
            variant="warning"
            onClick={() => {
              setReadOnly(false);
              setIsEdit(true);
            }}
          >
            Edit
          </Button>
        )}

        {isEdit && (
          <Button
            variant="success"
            onClick={() => {
              setReadOnly(false);
              setIsEdit(true);
            }}
          >
            Update {loading && "..."}
          </Button>
        )}
      </Form>
    </>
  );
}
