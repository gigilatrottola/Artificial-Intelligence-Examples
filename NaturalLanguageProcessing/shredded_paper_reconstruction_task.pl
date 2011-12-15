#!/usr/bin/perl
use strict;
use warnings;

my @shredded = (
  'de|  | f|Cl|nf|ed|au| i|ti|  |ma|ha|or|nn|ou| S|on|nd|on',
  'ry|  |is|th|is| b|eo|as|  |  |f |wh| o|ic| t|, |  |he|h ',
  'ab|  |la|pr|od|ge|ob| m|an|  |s |is|el|ti|ng|il|d |ua|c ',
  'he|  |ea|of|ho| m| t|et|ha|  | t|od|ds|e |ki| c|t |ng|br',
  'wo|m,|to|yo|hi|ve|u | t|ob|  |pr|d |s |us| s|ul|le|ol|e ',
  ' t|ca| t|wi| M|d |th|"A|ma|l |he| p|at|ap|it|he|ti|le|er',
  'ry|d |un|Th|" |io|eo|n,|is|  |bl|f |pu|Co|ic| o|he|at|mm',
  'hi|  |  |in|  |  | t|  |  |  |  |ye|  |ar|  |s |  |  |. ',
  );
my @shredded_matrix;

my %tokens; # 2 letter tokens from the shredded paper
my @token_list;
my %token_bigram_samples;
my %token_bigram_probabilities;

sub shredded_paper_reconstruction_task
{
  # extract tokens to map and list
  foreach my $line (@shredded) {
    my @line_list = split(/\|/, $line);
    foreach my $token (@line_list) {
      $tokens{$token} = 1;
    }
    push(@shredded_matrix, \@line_list);
  }
  @token_list = keys(%tokens);

  for (my $line_idx=0; $line_idx<@shredded_matrix; $line_idx++) {
    for (my $column_idx=0; $column_idx<@{$shredded_matrix[$line_idx]}; $column_idx++) {
      print($shredded_matrix[$line_idx][$column_idx]);
    }
    print("\n");
  }
  print("\n");

  # apply laplace smoothing with K=1
  foreach my $first (@token_list) {
    foreach my $second (@token_list) {
      $token_bigram_samples{$first}{$second} = 1;
    }
  }

  # read the text file used for sampling
  # file: http://www.gutenberg.org/cache/epub/1342/pg1342.txt ( The Project Gutenberg EBook of Pride and Prejudice, by Jane Austen )
  open(CORPUS, "../../pg1342.txt") or die("Cannot open corpus file"); 
  while(my $line = <CORPUS>) {
    my @letters = split('', $line);
    for (my $i=0; $i<(@letters-3); $i++) {
      my $first = $letters[$i].$letters[$i+1];
      my $second = $letters[$i+2].$letters[$i+3];
      # drop measurements where any of them is not a token
      if (defined($tokens{$first}) and defined($tokens{$second})) {
        $token_bigram_samples{$first}{$second}++; # add the sample
      }
    }
  }
  close(CORPUS);

  # normalize to probablity values
  foreach my $first (@token_list) {
    my $N = 0; # all samples for the actual first token ( total probablity for P(second|first) )
    foreach my $second (@token_list) {
        $N += $token_bigram_samples{$first}{$second};
    }
    #my $sum = 0.0;
    foreach my $second (@token_list) {
      $token_bigram_probabilities{$first}{$second} = $token_bigram_samples{$first}{$second} / $N;
      #$sum += $token_bigram_probabilities{$first}{$second};
      #print($first.">".$second."=".$token_bigram_samples{$first}{$second}." (".$token_bigram_probabilities{$first}{$second}.")  ");
    }
    #print("\n");
    #print("sum P(second|'".$first."')=" . $sum."\n"); # check correctness of probability values
  }

  # calculate best chance following column for each column
  my %best_follow_map; # the column that has the most probablity to be the right follow column
  my $column_count = @{$shredded_matrix[0]};
  for (my $column_idx=0; $column_idx<$column_count; $column_idx++) {
    my $best_follow;
    my $best_chance = 0.0;
    for (my $follow_idx=0; $follow_idx<$column_count; $follow_idx++) { # try all other columns
      next if ($follow_idx==$column_idx);
      my $chance = 1.0;
      for (my $line_idx=0; $line_idx<@shredded_matrix; $line_idx++) {
        my $first = $shredded_matrix[$line_idx][$column_idx];
        my $second = $shredded_matrix[$line_idx][$follow_idx];
        $chance *= $token_bigram_probabilities{$first}{$second};
        $chance *= 100.0; # trick to try keep within the double range
      }
      if ($chance>=$best_chance) {
        $best_chance = $chance;
        $best_follow = $follow_idx;
      }
    }
    $best_follow_map{$column_idx} = $best_follow;
  }



  #foreach my $f (keys(%best_follow_map)) {
  #  print($f.' -> '.$best_follow_map{$f}."\n");
  #}

  # print the probable follow order
  my @largest_order = ();
  for (my $begin_idx=0; $begin_idx<$column_count; $begin_idx++) {
    my %act_follow_map = %best_follow_map;
    my @order = ();
    my $act_idx = $begin_idx; # guess the first one
    push(@order, $act_idx);
    while (defined($act_follow_map{$act_idx})) {
      my $next_idx = $act_follow_map{$act_idx};
      push(@order, $next_idx);
      delete($act_follow_map{$act_idx});
      $act_idx = $next_idx;
    }
    #foreach my $idx (@order) {
    #  print($idx,'->');
    #}
    #print("\n");
    if (scalar(@order)>=scalar(@largest_order)) {
      @largest_order = @order;
    }
  }

  # collect the missing parts
  my %order_index_map = map { $_ => 1 } @largest_order;
  my @missing_indexes = ();
  for (my $idx=0; $idx<$column_count; $idx++) {
    if (not defined($order_index_map{$idx})) {
      push(@missing_indexes, $idx);
    }
  }

  # print the probable solution
  for (my $line_idx=0; $line_idx<@shredded_matrix; $line_idx++) {
    foreach my $column (@largest_order) {
      print($shredded_matrix[$line_idx][$column]);
    }
    foreach my $missing_column (@missing_indexes) {
      print($shredded_matrix[$line_idx][$missing_column]);
    }
    print("\n");
  }
  
}

shredded_paper_reconstruction_task();
