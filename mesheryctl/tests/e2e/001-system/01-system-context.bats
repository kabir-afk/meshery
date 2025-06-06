#!/usr/bin/env bats

setup() {
   load "$E2E_HELPERS_PATH/tests_helpers"
	_tests_helper

    ENDPOINT_REGEX_MATCH='^[[:space:]]*endpoint:[[:space:]](http|https)://.*:[[:digit:]]+$'
    TOKEN_REGEX_MATCH='^[[:space:]]*token:[[:space:]][[:alnum:]]+$'
    PLATFORM_REGEX_MATCH='^[[:space:]]*platform:[[:space:]](kubernetes|docker)+$'
    PROVIDER_REGEX_MATCH='^[[:space:]]*provider:[[:space:]][a-zA-Z]+$'
    CONTEXT_REGEXP_MATCH='^Current[[:space:]]Context:[[:space:]][a-zA-Z]+$'
}

# bats test_tags=system:context
@test "mesheryctl system context view --all display valid content" {
   run $MESHERYCTL_BIN system context view --all
   [ "$status" -eq 0 ]
   assert_line --regexp "$ENDPOINT_REGEX_MATCH"
   assert_line --regexp "$TOKEN_REGEX_MATCH"
   assert_line --regexp "$PLATFORM_REGEX_MATCH"
   assert_line --regexp "$PROVIDER_REGEX_MATCH"
}

# bats test_tags=system:context
@test "mesheryctl system context view display valid content" {
   run $MESHERYCTL_BIN system context view
   [ "$status" -eq 0 ]
   assert_line --regexp "$CONTEXT_REGEXP_MATCH"
   assert_line --regexp "$ENDPOINT_REGEX_MATCH"
   assert_line --regexp "$TOKEN_REGEX_MATCH"
   assert_line --regexp "$PLATFORM_REGEX_MATCH"
   assert_line --regexp "$PROVIDER_REGEX_MATCH"
}
