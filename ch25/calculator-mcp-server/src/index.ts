import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
      }
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    const server = new McpServer({
      name: 'calculator-mcp-server',
      version: '1.0.0',
    });

    server.registerTool('add', {
      description: '將兩個數字相加',
      inputSchema: {
        a: z.number().describe('第一個數字'),
        b: z.number().describe('第二個數字'),
      }
    }, async ({ a, b }) => ({
      content: [{ type: 'text', text: `${a + b}` }]
    }));

    server.registerTool('subtract', {
      description: '將第一個數字減去第二個數字',
      inputSchema: {
        a: z.number().describe('第一個數字'),
        b: z.number().describe('第二個數字'),
      }
    }, async ({ a, b }) => ({
      content: [{ type: 'text', text: `${a - b}` }]
    }));

    server.registerTool('multiply', {
      description: '將兩個數字相乘',
      inputSchema: {
        a: z.number().describe('第一個數字'),
        b: z.number().describe('第二個數字'),
      }
    }, async ({ a, b }) => ({
      content: [{ type: 'text', text: `${a * b}` }]
    }));

    server.registerTool('divide', {
      description: '將第一個數字除以第二個數字',
      inputSchema: {
        a: z.number().describe('第一個數字'),
        b: z.number().describe('第二個數字'),
      }
    }, async ({ a, b }) => {
      if (b === 0) return { content: [{ type: 'text', text: '錯誤：不能除以零' }], isError: true };
      return { content: [{ type: 'text', text: `${a / b}` }] };
    });

    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

app.get('/mcp', handleSessionRequest);
app.delete('/mcp', handleSessionRequest);

app.listen(PORT, () => {
  console.log(`[calculator-mcp-server] listening on port ${PORT}`);
});
