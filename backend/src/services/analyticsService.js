import { readJSON } from '../utils/fileManager.js';

export const getAnalytics = async () => {
  const queue = await readJSON('requests/queue.json') || { requests: [] };

  const statusCounts = queue.requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const brandCounts = queue.requests.reduce((acc, req) => {
    acc[req.brand] = (acc[req.brand] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = queue.requests.reduce((acc, req) => {
    acc[req.priority] = (acc[req.priority] || 0) + 1;
    return acc;
  }, {});

  const completedRequests = queue.requests.filter(r => r.status === 'deployed');
  const avgCycleTime = completedRequests.length > 0
    ? completedRequests.reduce((sum, req) => {
        const created = new Date(req.createdAt);
        const deployed = new Date(req.deployedAt || req.createdAt);
        return sum + (deployed - created);
      }, 0) / completedRequests.length / (1000 * 60 * 60)
    : 0;

  return {
    totalRequests: queue.requests.length,
    statusBreakdown: statusCounts,
    brandBreakdown: brandCounts,
    priorityBreakdown: priorityCounts,
    avgCycleTimeHours: Math.round(avgCycleTime * 10) / 10,
    bottleneck: identifyBottleneck(queue.requests)
  };
};

const identifyBottleneck = (requests) => {
  const stageTimes = {
    'in-progress': 0,
    'localization': 0,
    'qa-review': 0
  };

  requests.forEach(req => {
    if (req.status in stageTimes) {
      const timeInStage = Date.now() - new Date(req.updatedAt);
      stageTimes[req.status] += timeInStage;
    }
  });

  const slowestStage = Object.entries(stageTimes).sort((a, b) => b[1] - a[1])[0];
  return slowestStage ? slowestStage[0] : 'none';
};
