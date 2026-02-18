from setuptools import setup, find_packages

setup(
    name="markpre",
    version="1.0.2",  # ← bumped
    description="MarkPre CLI - Manage markdown presentations from your terminal",
    author="MarkPre",
    packages=find_packages(),
    install_requires=[
        "click>=8.0",
        "requests>=2.28",
        "rich>=13.0",
        "python-dotenv>=1.0",
    ],
    entry_points={
        "console_scripts": [
            "markpre=MarkPre.cli.cli:main",  # ← capital M to match your actual folder
        ],
    },
    python_requires=">=3.8",
)