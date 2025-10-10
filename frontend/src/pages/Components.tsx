import { useState, useEffect } from 'react';
import type { Component } from '../types';
import { componentAPI } from '../services/api';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';

export default function Components() {
  const [components, setComponents] = useState<Component[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    html: ''
  });
  const [useCodeEditor, setUseCodeEditor] = useState(false);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      const response = await componentAPI.getAll();
      setComponents(response.data);
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  const handleCreate = () => {
    setEditingComponent(null);
    setFormData({ name: '', description: '', html: '' });
    setShowEditor(true);
  };

  const handleEdit = (component: Component) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      description: component.description,
      html: component.html
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      if (editingComponent) {
        await componentAPI.update(editingComponent.id, formData);
      } else {
        await componentAPI.create(formData);
      }
      setShowEditor(false);
      loadComponents();
    } catch (error) {
      console.error('Error saving component:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      try {
        await componentAPI.delete(id);
        loadComponents();
      } catch (error) {
        console.error('Error deleting component:', error);
      }
    }
  };

  const copyShortcode = (id: string) => {
    navigator.clipboard.writeText(`{{temp.${id}}}`);
    alert(`Shortcode {{temp.${id}}} copied to clipboard!`);
  };

  if (showEditor) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          {editingComponent ? 'Edit Component' : 'Create New Component'}
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Component Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Component Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Login Button"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Brief description"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">HTML Code</label>
                  <button
                    type="button"
                    onClick={() => setUseCodeEditor(!useCodeEditor)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    {useCodeEditor ? 'Simple Editor' : 'Code Editor'}
                  </button>
                </div>

                {useCodeEditor ? (
                  <CodeMirror
                    value={formData.html}
                    height="350px"
                    theme={oneDark}
                    extensions={[html()]}
                    onChange={(value) => setFormData({ ...formData, html: value })}
                    className="border rounded overflow-hidden"
                  />
                ) : (
                  <textarea
                    value={formData.html}
                    onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={15}
                    placeholder='<button style="color:red">Login</button>'
                    required
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingComponent ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Live Preview</h3>
            <div className="border rounded p-4 bg-gray-50 min-h-[200px]">
              <p className="text-xs text-gray-600 mb-2">Preview:</p>
              <div
                dangerouslySetInnerHTML={{ __html: formData.html || '<p class="text-gray-400 italic">Preview will appear here...</p>' }}
              />
            </div>

            {formData.name && (
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3">
                <p className="text-sm font-semibold mb-2">Shortcode:</p>
                <code className="bg-white px-2 py-1 rounded text-sm border">
                  {`{{temp.${formData.name.toLowerCase().replace(/\s+/g, '_')}}}`}
                </code>
                <p className="text-xs text-gray-600 mt-2">
                  Use this shortcode in your templates to insert this component.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">HTML Components</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Component
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Create reusable HTML components (buttons, headers, footers) and insert them into templates using shortcodes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components.map((component) => (
          <div key={component.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{component.name}</h3>
                <p className="text-sm text-gray-600">{component.description}</p>
              </div>
            </div>

            <div className="bg-gray-50 border rounded p-3 my-3">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div dangerouslySetInnerHTML={{ __html: component.html }} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm flex-1">
                {`{{temp.${component.id}}}`}
              </code>
              <button
                onClick={() => copyShortcode(component.id)}
                className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
              >
                Copy
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(component)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(component.id)}
                className="flex-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {components.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No components created yet. Click "Create Component" to get started.
        </div>
      )}
    </div>
  );
}
