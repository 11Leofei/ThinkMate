/**
 * 🍎 Thought Gravity Engine - Jobs' Invisible Forces Made Visible
 * "There are invisible forces between thoughts. Let's make them beautiful."
 * 
 * Like iOS interface physics - natural, intuitive, surprisingly delightful.
 */

export interface ThoughtNode {
  id: string;
  content: string;
  timestamp: number;
  qualityScore: number;
  category: 'insight' | 'question' | 'idea' | 'observation' | 'connection';
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'excited' | 'contemplative';
  x: number;  // Position in gravity field
  y: number;  // Position in gravity field
  mass: number; // Gravitational mass based on importance
  velocity: { x: number; y: number }; // Movement velocity
  connections: ThoughtConnection[];
}

export interface ThoughtConnection {
  targetId: string;
  strength: number;      // Connection strength (0-100)
  type: 'semantic' | 'temporal' | 'emotional' | 'causal' | 'analogical';
  discoveredAt: number;  // When this connection was found
  confidence: number;    // How confident we are in this connection
}

export interface GravityField {
  width: number;
  height: number;
  nodes: ThoughtNode[];
  forces: GravityForce[];
  clusters: ThoughtCluster[];
  centerOfMass: { x: number; y: number };
}

export interface GravityForce {
  type: 'attraction' | 'repulsion' | 'orbital';
  sourceId: string;
  targetId: string;
  strength: number;
}

export interface ThoughtCluster {
  id: string;
  theme: string;
  nodeIds: string[];
  cohesion: number;      // How tightly clustered (0-100)
  centerX: number;
  centerY: number;
  radius: number;
  significance: 'major' | 'minor' | 'emerging';
}

export interface GravityInsight {
  type: 'new_cluster' | 'strong_connection' | 'isolated_thought' | 'gravity_shift';
  description: string;
  affectedNodes: string[];
  significance: number;  // 0-100
  actionSuggestion: string;
}

class ThoughtGravityEngine {
  private static instance: ThoughtGravityEngine;
  private gravityField: GravityField;
  private readonly FIELD_WIDTH = 800;
  private readonly FIELD_HEIGHT = 600;
  private readonly STORAGE_KEY = 'thinkmate_gravity_field';
  private animationFrame: number | null = null;

  public static getInstance(): ThoughtGravityEngine {
    if (!ThoughtGravityEngine.instance) {
      ThoughtGravityEngine.instance = new ThoughtGravityEngine();
    }
    return ThoughtGravityEngine.instance;
  }

  constructor() {
    this.gravityField = this.initializeField();
    this.loadGravityField();
  }

  /**
   * 🌟 Add new thought to gravity field
   * Jobs: "Every thought has mass and attracts other thoughts"
   */
  public addThought(
    content: string, 
    qualityScore: number, 
    category: ThoughtNode['category'] = 'idea'
  ): string {
    const node: ThoughtNode = {
      id: this.generateNodeId(),
      content,
      timestamp: Date.now(),
      qualityScore,
      category,
      emotionalTone: this.detectEmotionalTone(content),
      x: this.getRandomPosition().x,
      y: this.getRandomPosition().y,
      mass: this.calculateMass(qualityScore, content.length),
      velocity: { x: 0, y: 0 },
      connections: []
    };

    this.gravityField.nodes.push(node);
    this.discoverConnections(node);
    this.updateGravityForces();
    this.saveGravityField();

    return node.id;
  }

  /**
   * 🔍 Discover connections between thoughts
   * Jobs: "Connections should feel magical, not mechanical"
   */
  public discoverConnections(newNode: ThoughtNode): void {
    for (const existingNode of this.gravityField.nodes) {
      if (existingNode.id === newNode.id) continue;

      const connection = this.analyzeConnection(newNode, existingNode);
      if (connection && connection.strength > 30) { // Only strong connections
        newNode.connections.push(connection);
        
        // Create reciprocal connection
        const reciprocal: ThoughtConnection = {
          targetId: newNode.id,
          strength: connection.strength,
          type: connection.type,
          discoveredAt: connection.discoveredAt,
          confidence: connection.confidence
        };
        existingNode.connections.push(reciprocal);
      }
    }
  }

  /**
   * ⚡ Run gravity simulation step
   * Jobs: "Physics should feel natural, not computed"
   */
  public simulateGravity(): void {
    // Calculate forces between all nodes
    this.calculateGravitationalForces();
    
    // Update positions based on forces
    this.updateNodePositions();
    
    // Detect and update clusters
    this.updateClusters();
    
    // Check for new insights
    this.detectGravityInsights();
    
    this.saveGravityField();
  }

  /**
   * 🎯 Get current gravity field state
   */
  public getGravityField(): GravityField {
    return { ...this.gravityField };
  }

  /**
   * 🔮 Get gravity insights
   */
  public getGravityInsights(): GravityInsight[] {
    const insights: GravityInsight[] = [];

    // Detect isolated thoughts
    const isolatedNodes = this.gravityField.nodes.filter(node => 
      node.connections.length === 0 && node.mass > 50
    );

    if (isolatedNodes.length > 0) {
      insights.push({
        type: 'isolated_thought',
        description: `${isolatedNodes.length} high-quality thoughts are floating alone`,
        affectedNodes: isolatedNodes.map(n => n.id),
        significance: 70,
        actionSuggestion: 'Consider how these isolated insights might connect to your other thoughts'
      });
    }

    // Detect emerging clusters
    const emergingClusters = this.gravityField.clusters.filter(c => c.significance === 'emerging');
    if (emergingClusters.length > 0) {
      insights.push({
        type: 'new_cluster',
        description: `${emergingClusters.length} new thinking patterns are emerging`,
        affectedNodes: emergingClusters.flatMap(c => c.nodeIds),
        significance: 80,
        actionSuggestion: 'Explore these emerging patterns - they might lead to breakthroughs'
      });
    }

    // Detect gravity shifts (major changes in field)
    const centerShift = this.calculateCenterOfMassShift();
    if (centerShift > 100) {
      insights.push({
        type: 'gravity_shift',
        description: 'Your thinking focus has shifted significantly',
        affectedNodes: this.gravityField.nodes.map(n => n.id),
        significance: 60,
        actionSuggestion: 'Reflect on what new directions your thinking is taking'
      });
    }

    return insights.sort((a, b) => b.significance - a.significance);
  }

  /**
   * 🎨 Get visual representation data
   */
  public getVisualizationData(): {
    nodes: Array<{
      id: string;
      x: number;
      y: number;
      size: number;
      color: string;
      label: string;
      category: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
      strength: number;
      type: string;
    }>;
    clusters: Array<{
      x: number;
      y: number;
      radius: number;
      theme: string;
      significance: string;
    }>;
  } {
    const nodes = this.gravityField.nodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      size: Math.sqrt(node.mass) * 2,
      color: this.getNodeColor(node),
      label: node.content.substring(0, 30) + (node.content.length > 30 ? '...' : ''),
      category: node.category
    }));

    const edges: any[] = [];
    this.gravityField.nodes.forEach(node => {
      node.connections.forEach(conn => {
        if (conn.strength > 40) { // Only show strong connections
          edges.push({
            source: node.id,
            target: conn.targetId,
            strength: conn.strength,
            type: conn.type
          });
        }
      });
    });

    const clusters = this.gravityField.clusters.map(cluster => ({
      x: cluster.centerX,
      y: cluster.centerY,
      radius: cluster.radius,
      theme: cluster.theme,
      significance: cluster.significance
    }));

    return { nodes, edges, clusters };
  }

  // 🛠️ Private helper methods - Jobs' obsession with perfect implementation

  private initializeField(): GravityField {
    return {
      width: this.FIELD_WIDTH,
      height: this.FIELD_HEIGHT,
      nodes: [],
      forces: [],
      clusters: [],
      centerOfMass: { x: this.FIELD_WIDTH / 2, y: this.FIELD_HEIGHT / 2 }
    };
  }

  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectEmotionalTone(content: string): ThoughtNode['emotionalTone'] {
    const positiveWords = /exciting|amazing|breakthrough|wonderful|great|fantastic|brilliant/i;
    const negativeWords = /worried|concerned|problem|difficult|challenge|frustrated|stuck/i;
    const excitedWords = /eureka|aha|discovered|realized|incredible|wow/i;
    const contemplativeWords = /wonder|ponder|consider|reflect|think about|contemplate/i;

    if (excitedWords.test(content)) return 'excited';
    if (positiveWords.test(content)) return 'positive';
    if (negativeWords.test(content)) return 'negative';
    if (contemplativeWords.test(content)) return 'contemplative';
    return 'neutral';
  }

  private getRandomPosition(): { x: number; y: number } {
    return {
      x: Math.random() * this.FIELD_WIDTH,
      y: Math.random() * this.FIELD_HEIGHT
    };
  }

  private calculateMass(qualityScore: number, contentLength: number): number {
    // Mass based on quality and content richness
    const baseMass = (qualityScore / 100) * 50;
    const lengthBonus = Math.min(contentLength / 100, 20);
    return baseMass + lengthBonus;
  }

  private analyzeConnection(node1: ThoughtNode, node2: ThoughtNode): ThoughtConnection | null {
    let strength = 0;
    let type: ThoughtConnection['type'] = 'semantic';

    // Semantic similarity (simplified)
    const words1 = this.extractKeywords(node1.content);
    const words2 = this.extractKeywords(node2.content);
    const commonWords = words1.filter(word => words2.includes(word));
    const semanticStrength = (commonWords.length / Math.max(words1.length, words2.length)) * 100;

    // Temporal proximity
    const timeDiff = Math.abs(node1.timestamp - node2.timestamp);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    const temporalStrength = Math.max(0, 100 - (daysDiff * 10));

    // Emotional resonance
    const emotionalStrength = node1.emotionalTone === node2.emotionalTone ? 20 : 0;

    // Category alignment
    const categoryStrength = node1.category === node2.category ? 15 : 0;

    // Calculate overall strength
    strength = Math.max(semanticStrength, temporalStrength) + emotionalStrength + categoryStrength;

    // Determine connection type
    if (semanticStrength > temporalStrength) {
      type = 'semantic';
    } else if (temporalStrength > 50) {
      type = 'temporal';
    } else if (emotionalStrength > 0) {
      type = 'emotional';
    }

    if (strength < 20) return null; // Too weak to be meaningful

    return {
      targetId: node2.id,
      strength: Math.min(100, strength),
      type,
      discoveredAt: Date.now(),
      confidence: Math.min(100, strength * 0.8)
    };
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  private updateGravityForces(): void {
    this.gravityField.forces = [];

    for (let i = 0; i < this.gravityField.nodes.length; i++) {
      for (let j = i + 1; j < this.gravityField.nodes.length; j++) {
        const node1 = this.gravityField.nodes[i];
        const node2 = this.gravityField.nodes[j];

        const connection = node1.connections.find(c => c.targetId === node2.id);
        if (connection && connection.strength > 30) {
          this.gravityField.forces.push({
            type: 'attraction',
            sourceId: node1.id,
            targetId: node2.id,
            strength: connection.strength
          });
        }
      }
    }
  }

  private calculateGravitationalForces(): void {
    // Reset velocities
    this.gravityField.nodes.forEach(node => {
      node.velocity = { x: 0, y: 0 };
    });

    // Calculate forces between connected nodes
    this.gravityField.forces.forEach(force => {
      const sourceNode = this.gravityField.nodes.find(n => n.id === force.sourceId);
      const targetNode = this.gravityField.nodes.find(n => n.id === force.targetId);

      if (!sourceNode || !targetNode) return;

      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) return;

      const forceStrength = (force.strength / 100) * 0.1;
      const fx = (dx / distance) * forceStrength;
      const fy = (dy / distance) * forceStrength;

      if (force.type === 'attraction') {
        sourceNode.velocity.x += fx;
        sourceNode.velocity.y += fy;
        targetNode.velocity.x -= fx;
        targetNode.velocity.y -= fy;
      }
    });

    // Add slight repulsion to prevent overlap
    for (let i = 0; i < this.gravityField.nodes.length; i++) {
      for (let j = i + 1; j < this.gravityField.nodes.length; j++) {
        const node1 = this.gravityField.nodes[i];
        const node2 = this.gravityField.nodes[j];

        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50 && distance > 0) {
          const repulsionForce = 0.5 / distance;
          const fx = (dx / distance) * repulsionForce;
          const fy = (dy / distance) * repulsionForce;

          node1.velocity.x -= fx;
          node1.velocity.y -= fy;
          node2.velocity.x += fx;
          node2.velocity.y += fy;
        }
      }
    }
  }

  private updateNodePositions(): void {
    this.gravityField.nodes.forEach(node => {
      // Apply velocity with damping
      const damping = 0.8;
      node.x += node.velocity.x * damping;
      node.y += node.velocity.y * damping;

      // Keep nodes within bounds
      node.x = Math.max(20, Math.min(this.FIELD_WIDTH - 20, node.x));
      node.y = Math.max(20, Math.min(this.FIELD_HEIGHT - 20, node.y));
    });
  }

  private updateClusters(): void {
    // Simple clustering based on proximity and connections
    this.gravityField.clusters = [];
    const processedNodes = new Set<string>();

    this.gravityField.nodes.forEach(node => {
      if (processedNodes.has(node.id)) return;

      const cluster = this.findClusterAround(node, processedNodes);
      if (cluster.nodeIds.length >= 2) {
        this.gravityField.clusters.push(cluster);
      }
    });
  }

  private findClusterAround(centerNode: ThoughtNode, processedNodes: Set<string>): ThoughtCluster {
    const clusterNodes = [centerNode];
    const queue = [centerNode];
    const visited = new Set([centerNode.id]);

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      
      currentNode.connections.forEach(conn => {
        if (conn.strength > 50 && !visited.has(conn.targetId)) {
          const connectedNode = this.gravityField.nodes.find(n => n.id === conn.targetId);
          if (connectedNode && !processedNodes.has(connectedNode.id)) {
            clusterNodes.push(connectedNode);
            queue.push(connectedNode);
            visited.add(connectedNode.id);
          }
        }
      });
    }

    // Mark all nodes in this cluster as processed
    clusterNodes.forEach(node => processedNodes.add(node.id));

    // Calculate cluster properties
    const centerX = clusterNodes.reduce((sum, n) => sum + n.x, 0) / clusterNodes.length;
    const centerY = clusterNodes.reduce((sum, n) => sum + n.y, 0) / clusterNodes.length;
    const maxDistance = Math.max(...clusterNodes.map(n => 
      Math.sqrt((n.x - centerX) ** 2 + (n.y - centerY) ** 2)
    ));

    return {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      theme: this.inferClusterTheme(clusterNodes),
      nodeIds: clusterNodes.map(n => n.id),
      cohesion: this.calculateCohesion(clusterNodes),
      centerX,
      centerY,
      radius: maxDistance + 20,
      significance: clusterNodes.length > 4 ? 'major' : clusterNodes.length > 2 ? 'minor' : 'emerging'
    };
  }

  private inferClusterTheme(nodes: ThoughtNode[]): string {
    // Simple theme inference based on common categories and content
    const categories = nodes.map(n => n.category);
    const mostCommonCategory = this.getMostFrequent(categories);
    
    return `${mostCommonCategory.charAt(0).toUpperCase() + mostCommonCategory.slice(1)} Cluster`;
  }

  private calculateCohesion(nodes: ThoughtNode[]): number {
    if (nodes.length < 2) return 100;

    let totalConnections = 0;
    let possibleConnections = 0;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        possibleConnections++;
        const connection = nodes[i].connections.find(c => c.targetId === nodes[j].id);
        if (connection && connection.strength > 30) {
          totalConnections++;
        }
      }
    }

    return possibleConnections > 0 ? (totalConnections / possibleConnections) * 100 : 0;
  }

  private getMostFrequent<T>(arr: T[]): T {
    const frequency = new Map<T, number>();
    arr.forEach(item => frequency.set(item, (frequency.get(item) || 0) + 1));
    return Array.from(frequency.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  private detectGravityInsights(): void {
    // This would analyze the gravity field for interesting patterns
    // Implementation would depend on specific insight detection algorithms
  }

  private calculateCenterOfMassShift(): number {
    // Calculate how much the center of mass has shifted
    // This would require storing previous center of mass
    return 0; // Simplified for now
  }

  private getNodeColor(node: ThoughtNode): string {
    const colors = {
      insight: '#10B981',     // Green
      question: '#3B82F6',    // Blue
      idea: '#8B5CF6',        // Purple
      observation: '#F59E0B', // Yellow
      connection: '#EF4444'   // Red
    };
    return colors[node.category] || '#6B7280';
  }

  private loadGravityField(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.gravityField = { ...this.gravityField, ...data };
      }
    } catch (error) {
      console.warn('Could not load gravity field:', error);
    }
  }

  private saveGravityField(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.gravityField));
    } catch (error) {
      console.warn('Could not save gravity field:', error);
    }
  }

  /**
   * 🎬 Start gravity simulation animation
   */
  public startSimulation(): void {
    if (this.animationFrame) return;

    const animate = () => {
      this.simulateGravity();
      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * ⏸️ Stop gravity simulation
   */
  public stopSimulation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

export default ThoughtGravityEngine;