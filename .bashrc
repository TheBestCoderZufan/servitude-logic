# ~/.bashrc

# Each time you update this file RUN: source .bashrc
# Then to create the directory tree run : update_tree
# source .bashrc && update_tree && code DIRECTORY_TREE.md
# source .bashrc


# ============================
# Aliases
# ============================
alias ll='ls -lah'
alias gs='npm run clear && git status && git branch'

alias env='npm run clear && npm run env'
alias shair='npm run clear && npm run shair'
alias doc='npm run doc'
alias touchFile='npm run touchFile'

alias rmNext='rm -rf .next'

# ============================
# Environment Variables
# ============================
export PATH="$HOME/bin:$PATH"
export EDITOR="vim"


# ============================
alias cp_util_to_test='rm -rf "/Users/kidustadesse/Code/Utility/TestUtility/src" && cp -rpv "/Users/kidustadesse/Code/Utility/utility/src" "/Users/kidustadesse/Code/Utility/TestUtility/"'

# Define excluded directories
excluded_directories="node_modules|Shell|temp|Notes|Backup|migrations"

# Function to update the directory tree in DIRECTORY_TREE.md
# update_tree() {
#     local temp_file="temp"
#     local temp_readme="temp2"

#     # Get the base name of the current working directory
#     local project_name
#     project_name=$(basename "$(pwd)")

#     echo "\nGenerating directory tree for project: $project_name..."
    
#     # Create the tree structure in markdown format
#     echo "\`\`\`bash" > "$temp_file"
#     tree -I "$excluded_directories" --prune | \
#         sed -e "/Logs$/s/[^/]*/Logs/" \
#             -e "/docs$/s/[^/]*/docs/" \
#             -e "s/^\./$project_name/" >> "$temp_file"
    
#     echo "\`\`\`" >> "$temp_file"

#     echo "\nUpdating DIRECTORY_TREE.md..."

#     # Update DIRECTORY_TREE.md within the specified markers
#     sed -e "/<!-- DIRECTORY_TREE_START -->/,/<!-- DIRECTORY_TREE_END -->/{//!d;}" \
#         -e "/<!-- DIRECTORY_TREE_START -->/r $temp_file" DIRECTORY_TREE.md > "$temp_readme"

#     # Replace the old DIRECTORY_TREE with the updated one
#     mv "$temp_readme" DIRECTORY_TREE.md

#     # Clean up temporary files
#     rm "$temp_file"

#     echo "\nDirectory tree updated successfully in DIRECTORY_TREE.md."
# }
update_tree() {
    local temp_file="temp"
    local temp_readme="temp2"
    local source_dir="${1:-$(pwd)}"  # Use provided parameter or default to current directory

    # Get the base name of the current working directory
    local project_name
    project_name=$(basename "$(pwd)")
    local dir_name=$(basename "$source_dir")

    echo "\nGenerating directory tree for $dir_name/ in project: $project_name..."
    
    # Create the tree structure in markdown format
    echo "\`\`\`bash" > "$temp_file"
    tree "$source_dir" -I "$excluded_directories" --prune | \
        sed -e "/Logs$/s/[^/]*/Logs/" \
            -e "/docs$/s/[^/]*/docs/" \
            -e "s/^\./$dir_name/" >> "$temp_file"
    
    echo "\`\`\`" >> "$temp_file"

    echo "\nUpdating DIRECTORY_TREE.md..."

    # Update DIRECTORY_TREE.md within the specified markers
    sed -e "/<!-- DIRECTORY_TREE_START -->/,/<!-- DIRECTORY_TREE_END -->/{//!d;}" \
        -e "/<!-- DIRECTORY_TREE_START -->/r $temp_file" DIRECTORY_TREE.md > "$temp_readme"

    # Replace the old DIRECTORY_TREE with the updated one
    mv "$temp_readme" DIRECTORY_TREE.md

    # Clean up temporary files
    rm "$temp_file"

    echo "\nDirectory tree updated successfully in DIRECTORY_TREE.md."
}
# ============================
# Load Custom Scripts (if any)
# ============================
# if [ -f ~/.bash_aliases ]; then
#     . ~/.bash_aliases
# fi

# ============================
# Custom Prompt (Example)
# ============================
# PS1='\u@\h:\w\$ '

# ============================
# End of .bashrc
# ============================

