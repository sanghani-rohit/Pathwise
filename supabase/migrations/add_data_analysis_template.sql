-- ============================================================================
-- Add Data Analysis Roadmap Template
-- ============================================================================

-- Delete existing Data Analysis template if it exists
DELETE FROM roadmap_templates WHERE skill = 'Data Analysis';

-- Insert Data Analysis template (10 comprehensive modules)
INSERT INTO roadmap_templates (skill, module_name, subtopics, order_index, level, tools, prerequisites) VALUES

-- Module 1: Excel Fundamentals
('Data Analysis', 'Excel Fundamentals for Data Analysis',
 ARRAY['Basic Functions (SUM, AVERAGE, COUNT)', 'Cell References (Relative, Absolute, Mixed)', 'Data Formatting and Validation', 'Sorting and Filtering', 'Conditional Formatting', 'Basic Charts and Graphs'],
 1, 'beginner',
 ARRAY['Microsoft Excel 2016+', 'Google Sheets', 'LibreOffice Calc'],
 ARRAY[]::TEXT[]),

-- Module 2: Advanced Excel
('Data Analysis', 'Advanced Excel Techniques',
 ARRAY['Pivot Tables and Pivot Charts', 'VLOOKUP and HLOOKUP', 'INDEX and MATCH Functions', 'Advanced Formulas (IF, SUMIF, COUNTIF)', 'Data Tables and What-If Analysis', 'Macros and VBA Basics'],
 2, 'intermediate',
 ARRAY['Microsoft Excel 2016+', 'VBA Editor'],
 ARRAY['Excel Fundamentals for Data Analysis']),

-- Module 3: Python for Data Analysis
('Data Analysis', 'Python Programming for Data Analysis',
 ARRAY['Python Basics (Variables, Data Types, Control Flow)', 'Functions and Modules', 'File I/O Operations', 'Working with CSV and Excel Files', 'Error Handling', 'Object-Oriented Programming Basics'],
 3, 'beginner',
 ARRAY['Python 3.8+', 'Jupyter Notebook', 'VS Code', 'Anaconda'],
 ARRAY['Excel Fundamentals for Data Analysis']),

-- Module 4: Pandas and NumPy
('Data Analysis', 'Data Manipulation with Pandas and NumPy',
 ARRAY['NumPy Arrays and Operations', 'Pandas DataFrames and Series', 'Data Loading (CSV, Excel, SQL)', 'Data Cleaning (Handling Missing Data, Duplicates)', 'Data Transformation (GroupBy, Pivot, Merge)', 'Time Series Analysis'],
 4, 'intermediate',
 ARRAY['Python 3.8+', 'Pandas', 'NumPy', 'Jupyter Notebook'],
 ARRAY['Python Programming for Data Analysis']),

-- Module 5: Data Visualization
('Data Analysis', 'Data Visualization with Python',
 ARRAY['Matplotlib Basics', 'Seaborn for Statistical Plots', 'Plotly for Interactive Charts', 'Chart Types (Line, Bar, Scatter, Histogram)', 'Dashboard Creation', 'Best Practices in Data Visualization'],
 5, 'intermediate',
 ARRAY['Matplotlib', 'Seaborn', 'Plotly', 'Python 3.8+'],
 ARRAY['Data Manipulation with Pandas and NumPy']),

-- Module 6: Statistics for Data Analysis
('Data Analysis', 'Statistics and Probability',
 ARRAY['Descriptive Statistics (Mean, Median, Mode, Variance)', 'Probability Distributions', 'Hypothesis Testing', 'Correlation and Regression', 'Statistical Significance', 'A/B Testing'],
 6, 'intermediate',
 ARRAY['Python 3.8+', 'SciPy', 'StatsModels', 'Excel'],
 ARRAY['Data Manipulation with Pandas and NumPy']),

-- Module 7: SQL for Data Analysis
('Data Analysis', 'SQL and Database Fundamentals',
 ARRAY['SQL Basics (SELECT, WHERE, ORDER BY)', 'Joins (INNER, LEFT, RIGHT, FULL)', 'Aggregations (GROUP BY, HAVING)', 'Subqueries and CTEs', 'Window Functions', 'Database Design Basics'],
 7, 'intermediate',
 ARRAY['PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'DBeaver'],
 ARRAY['Python Programming for Data Analysis']),

-- Module 8: Tableau Fundamentals
('Data Analysis', 'Business Intelligence with Tableau',
 ARRAY['Tableau Interface and Workspace', 'Connecting to Data Sources', 'Creating Basic Visualizations', 'Calculated Fields and Parameters', 'Interactive Dashboards', 'Publishing and Sharing'],
 8, 'intermediate',
 ARRAY['Tableau Desktop', 'Tableau Public'],
 ARRAY['Data Visualization with Python', 'SQL and Database Fundamentals']),

-- Module 9: Advanced Analytics
('Data Analysis', 'Advanced Analytics and Machine Learning Basics',
 ARRAY['Predictive Analytics Overview', 'Linear and Logistic Regression', 'Decision Trees and Random Forests', 'Clustering (K-Means)', 'Model Evaluation Metrics', 'Scikit-learn Basics'],
 9, 'advanced',
 ARRAY['Python 3.8+', 'Scikit-learn', 'Pandas', 'Jupyter Notebook'],
 ARRAY['Statistics and Probability', 'Data Manipulation with Pandas and NumPy']),

-- Module 10: Real-World Projects
('Data Analysis', 'Data Analysis Portfolio Projects',
 ARRAY['Sales Data Analysis Dashboard', 'Customer Segmentation Analysis', 'Time Series Forecasting', 'Survey Data Analysis', 'Web Scraping and Analysis', 'End-to-End Data Pipeline'],
 10, 'advanced',
 ARRAY['Python 3.8+', 'Pandas', 'Tableau', 'SQL', 'Jupyter Notebook', 'Git'],
 ARRAY['Business Intelligence with Tableau', 'Advanced Analytics and Machine Learning Basics']);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Data Analysis template added successfully!';
  RAISE NOTICE 'Total modules: 10';
  RAISE NOTICE 'Skill: Data Analysis';
END $$;
