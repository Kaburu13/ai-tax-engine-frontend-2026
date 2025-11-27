import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

type QueueItem = {
  id: string;
  original_filename: string;
  status: string;
};

const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [items, setItems] = useState<QueueItem[]>([]);
  const [count, setCount] = useState(0);
  const targetId = location?.state?.workbookId as string | undefined;
  const seenCompleteRef = useRef(false);

  useEffect(() => {
    let timer: any;

    const tick = async () => {
      const res = await api.get<{ count: number; workbooks: QueueItem[] }>(
        "/workbooks/processing-queue/"
      );
      setCount(res.data.count);
      setItems(res.data.workbooks);

      // If we just started something, watch that id and divert to /reports when it's no longer in queue
      if (targetId && !seenCompleteRef.current) {
        const stillInQueue = res.data.workbooks.some((w) => w.id === targetId);
        if (!stillInQueue) {
          seenCompleteRef.current = true;
          navigate("/reports", { state: { fromQueue: true, workbookId: targetId } });
        }
      }
    };

    tick();
    timer = setInterval(tick, 2000);
    return () => clearInterval(timer);
  }, [navigate, targetId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Processing Queue</h1>
      <div className="mb-4 text-sm text-gray-600">
        <span className="px-2 py-1 rounded bg-blue-50 border border-blue-200">
          {count} workbook(s) in queue
        </span>
      </div>

      {count === 0 ? (
        <div className="text-gray-500">No workbooks processing</div>
      ) : (
        <div className="rounded border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Workbook</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-3 py-2">{w.original_filename}</td>
                  <td className="px-3 py-2">{w.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate("/reports")}
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-black"
        >
          Go to Reports
        </button>
      </div>
    </div>
  );
};

export default ProcessingPage;
