// src/hooks/useWorkflowEvents.js
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * @typedef {Object} WorkflowEvent
 * @property {string} type - Event type, usually "workflow.event".
 * @property {Object} [event] - Event payload when type equals "workflow.event".
 */

/**
 * Client hook that maintains a resilient SSE connection to the workflow event stream.
 *
 * @param {Object} [options] - Optional configuration.
 * @param {Function} [options.onEvent] - Callback invoked for each workflow event payload.
 * @returns {Object} Connection state and last event.
*/
export function useWorkflowEvents(options = {}) {
  const { onEvent } = options;
  const [connected, setConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const eventHandlerRef = useRef(onEvent);
  const reconnectTimeoutRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    eventHandlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    function cleanup() {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnected(false);
    }

    function scheduleReconnect(delay) {
      if (reconnectTimeoutRef.current) return;
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connect();
      }, delay);
    }

    function connect() {
      cleanup();
      const source = new EventSource("/api/workflow/events");
      eventSourceRef.current = source;

      source.onopen = () => {
        setConnected(true);
      };

      source.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          setLatestEvent(payload);
          if (eventHandlerRef.current) {
            eventHandlerRef.current(payload);
          }
        } catch (error) {
          console.error("Failed to parse workflow event", error);
        }
      };

      source.onerror = () => {
        setConnected(false);
        scheduleReconnect(3000);
      };
    }

    connect();

    return () => {
      cleanup();
    };
  }, []);

  return useMemo(
    () => ({
      connected,
      latestEvent,
    }),
    [connected, latestEvent],
  );
}
